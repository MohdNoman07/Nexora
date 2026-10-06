"""
Real-dataset benchmark (plan §4) — the defensible precision/recall/F1.

The live demo runs on the simulator; this script produces the honest number on
REAL labelled network-intrusion data. It is NOT run automatically (the datasets
are hundreds of MB and are not committed). Drop a dataset into data/raw/ and run:

    python -m detection.benchmark_cicids --dataset cicids2017
    python -m detection.benchmark_cicids --dataset unsw

Expected layout:
    data/raw/CICIDS2017/*.csv          (the MachineLearningCVE CSVs)
    data/raw/UNSW-NB15/UNSW_NB15_training-set.csv
    data/raw/UNSW-NB15/UNSW_NB15_testing-set.csv

Writes data/processed/metrics_real.json with per-class metrics, a binary
attack-vs-benign IsolationForest result, and the benign false-positive rate.
This mirrors the Week-1/Week-2 notebook methodology but as a repeatable script.
"""

from __future__ import annotations

import argparse
import glob
import json
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data" / "processed" / "metrics_real.json"


def _clean_numeric(df: pd.DataFrame) -> pd.DataFrame:
    df = df.replace([np.inf, -np.inf], np.nan).dropna()
    return df


def load_cicids2017() -> tuple[pd.DataFrame, pd.Series]:
    files = sorted(glob.glob(str(RAW / "CICIDS2017" / "*.csv"))) or \
            sorted(glob.glob(str(RAW / "MachineLearningCVE" / "*.csv")))
    if not files:
        raise FileNotFoundError(
            "No CICIDS2017 CSVs found under data/raw/CICIDS2017/ (the "
            "MachineLearningCVE CSVs). See the module docstring."
        )
    frames = [pd.read_csv(f, low_memory=False) for f in files]
    df = pd.concat(frames, ignore_index=True)
    df.columns = [c.strip() for c in df.columns]
    label_col = "Label" if "Label" in df.columns else df.columns[-1]
    y = df[label_col].astype(str).str.strip()
    X = df.drop(columns=[label_col]).select_dtypes(include=[np.number])
    data = _clean_numeric(pd.concat([X, y.rename("__label__")], axis=1))
    return data.drop(columns="__label__"), data["__label__"]


def load_unsw() -> tuple[pd.DataFrame, pd.Series]:
    tr = RAW / "UNSW-NB15" / "UNSW_NB15_training-set.csv"
    te = RAW / "UNSW-NB15" / "UNSW_NB15_testing-set.csv"
    if not tr.exists():
        raise FileNotFoundError("No UNSW-NB15 CSVs under data/raw/UNSW-NB15/.")
    frames = [pd.read_csv(tr)]
    if te.exists():
        frames.append(pd.read_csv(te))
    df = pd.concat(frames, ignore_index=True)
    y = df["attack_cat"].fillna("Normal").astype(str) if "attack_cat" in df.columns \
        else df["label"].map({0: "Normal", 1: "Attack"})
    drop = [c for c in ("id", "label", "attack_cat") if c in df.columns]
    X = df.drop(columns=drop).select_dtypes(include=[np.number])
    data = _clean_numeric(pd.concat([X, y.rename("__label__")], axis=1))
    return data.drop(columns="__label__"), data["__label__"]


def run(dataset: str, sample: int | None = 200_000, seed: int = 42) -> dict:
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
    from sklearn.ensemble import IsolationForest, RandomForestClassifier
    from sklearn.metrics import (classification_report, precision_score,
                                 recall_score, f1_score, confusion_matrix)

    X, y = load_cicids2017() if dataset == "cicids2017" else load_unsw()
    benign_name = "BENIGN" if dataset == "cicids2017" else "Normal"

    if sample and len(X) > sample:
        X = X.sample(sample, random_state=seed)
        y = y.loc[X.index]

    is_attack = (y != benign_name).astype(int)

    X_tr, X_te, y_tr, y_te, atk_tr, atk_te = train_test_split(
        X, y, is_attack, test_size=0.3, random_state=seed, stratify=is_attack
    )
    scaler = StandardScaler().fit(X_tr)
    X_tr_s, X_te_s = scaler.transform(X_tr), scaler.transform(X_te)

    # --- Supervised multi-class classifier ---
    clf = RandomForestClassifier(n_estimators=200, class_weight="balanced",
                                 random_state=seed, n_jobs=-1)
    clf.fit(X_tr_s, y_tr)
    y_pred = clf.predict(X_te_s)
    report = classification_report(y_te, y_pred, output_dict=True, zero_division=0)

    # --- Unsupervised IsolationForest, fit on benign only (honest anomaly setup) ---
    iso = IsolationForest(n_estimators=200, contamination="auto",
                          random_state=seed, n_jobs=-1)
    iso.fit(X_tr_s[atk_tr.values == 0])
    raw = -iso.score_samples(X_te_s)
    thr = np.percentile(raw, 90)  # top 10% most anomalous flagged
    anom_pred = (raw >= thr).astype(int)

    labels_sorted = sorted(y.unique())
    cm = confusion_matrix(y_te, y_pred, labels=labels_sorted).tolist()
    bi = labels_sorted.index(benign_name)
    benign_total = sum(cm[bi])
    fpr = round((benign_total - cm[bi][bi]) / benign_total, 4) if benign_total else None

    metrics = {
        "source": f"real:{dataset}",
        "note": "Measured on real labelled network-intrusion data.",
        "n_test": int(len(y_te)),
        "classifier": {
            "model": "RandomForestClassifier(class_weight=balanced)",
            "macro_f1": round(report["macro avg"]["f1-score"], 4),
            "accuracy": round(report["accuracy"], 4),
            "per_class": {
                k: {"precision": round(v["precision"], 4),
                    "recall": round(v["recall"], 4),
                    "f1": round(v["f1-score"], 4),
                    "support": int(v["support"])}
                for k, v in report.items()
                if k not in ("accuracy", "macro avg", "weighted avg")
            },
        },
        "anomaly_detection": {
            "model": "IsolationForest(fit on benign), attack-vs-benign",
            "precision": round(float(precision_score(atk_te, anom_pred, zero_division=0)), 4),
            "recall": round(float(recall_score(atk_te, anom_pred, zero_division=0)), 4),
            "f1": round(float(f1_score(atk_te, anom_pred, zero_division=0)), 4),
        },
        "false_positive_rate_benign": fpr,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(metrics, indent=2))
    print(json.dumps(metrics, indent=2))
    print(f"\nWritten to {OUT}")
    return metrics


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", choices=["cicids2017", "unsw"], default="cicids2017")
    ap.add_argument("--sample", type=int, default=200_000,
                    help="max rows to subsample (class-stratified); 0 for all")
    args = ap.parse_args()
    run(args.dataset, sample=args.sample or None)
