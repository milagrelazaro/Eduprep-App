"""
Script para converter ficheiros XLSX da pasta examesupload/ num unico CSV deduplicado.
Uso: python scripts/convertXlsxToCSV.py
Output: data/exames_import.csv
"""

import openpyxl
import csv
import os
import sys

UPLOAD_DIR = "examesupload"
OUTPUT_FILE = "data/exames_import.csv"

HEADERS = [
    "institution", "subject", "year", "duration", "status", "topic",
    "question_text", "option_a", "option_b", "option_c", "option_d", "option_e",
    "correct_option", "explanation", "correct_feedback", "incorrect_feedback", "learn_more_url"
]

def find_header_row(ws):
    for r in range(1, 20):
        val = ws.cell(row=r, column=1).value
        if val and str(val).strip().startswith("institution"):
            return r
    return None

def read_xlsx(filepath):
    wb = openpyxl.load_workbook(filepath, data_only=True)
    ws = wb.active
    header_row = find_header_row(ws)
    if not header_row:
        print(f"  [AVISO] Cabeçalho nao encontrado em {filepath}")
        return []

    # Ler headers do ficheiro
    file_headers = []
    for c in range(1, ws.max_column + 1):
        val = ws.cell(row=header_row, column=c).value
        if val:
            file_headers.append(str(val).strip().replace("*", ""))
        else:
            break

    # Dados comecam 2 linhas apos header (skip description row)
    data_start = header_row + 2
    rows = []
    for r in range(data_start, ws.max_row + 1):
        row_data = {}
        has_data = False
        for c_idx, h in enumerate(file_headers, 1):
            val = ws.cell(row=r, column=c_idx).value
            if val is not None and str(val).strip():
                has_data = True
            row_data[h] = val

        if not has_data:
            continue

        # Verificar campos obrigatorios
        if not row_data.get("institution") or not row_data.get("question_text"):
            continue

        # Construir linha no formato esperado
        row = {}
        for h in HEADERS:
            val = row_data.get(h)
            if val is None:
                row[h] = ""
            elif isinstance(val, float) and val.is_integer():
                row[h] = str(int(val))
            else:
                row[h] = str(val).strip()

        rows.append(row)

    return rows

def main():
    if not os.path.isdir(UPLOAD_DIR):
        print(f"Erro: pasta {UPLOAD_DIR} nao encontrada")
        sys.exit(1)

    os.makedirs("data", exist_ok=True)

    xlsx_files = sorted([f for f in os.listdir(UPLOAD_DIR) if f.endswith(".xlsx") and not f.startswith("~")])
    if not xlsx_files:
        print("Nenhum ficheiro .xlsx encontrado em examesupload/")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"  CONVERSAO XLSX -> CSV (Eduprep/SimulaPass)")
    print(f"{'='*60}\n")

    all_rows = []
    seen_exams = set()  # Para deduplicar exames
    seen_questions = set()  # Para deduplicar questoes exatas

    for f in xlsx_files:
        filepath = os.path.join(UPLOAD_DIR, f)
        print(f"  Lendo: {f}")
        rows = read_xlsx(filepath)

        # Agrupar por exame para deduplicar
        exams_in_file = {}
        for row in rows:
            key = f"{row['institution']}-{row['subject']}-{row['year']}"
            if key not in exams_in_file:
                exams_in_file[key] = []
            exams_in_file[key].append(row)

        for exam_key, exam_rows in exams_in_file.items():
            if exam_key in seen_exams:
                print(f"    [SKIP] {exam_key} - ja importado de outro ficheiro")
                continue
            seen_exams.add(exam_key)

            # Deduplicar questoes dentro do exame
            unique_rows = []
            for row in exam_rows:
                q_key = f"{exam_key}-{row['question_text'][:50]}"
                if q_key in seen_questions:
                    continue
                seen_questions.add(q_key)
                unique_rows.append(row)

            print(f"    [OK] {exam_key} - {len(unique_rows)} questoes")
            all_rows.extend(unique_rows)

    # Escrever CSV
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=HEADERS)
        writer.writeheader()
        writer.writerows(all_rows)

    # Resumo
    exams_set = set()
    for row in all_rows:
        exams_set.add(f"{row['institution']}-{row['subject']}-{row['year']}")

    print(f"\n{'='*60}")
    print(f"  RESUMO:")
    print(f"  CSV gerado: {OUTPUT_FILE}")
    print(f"  Total questoes: {len(all_rows)}")
    print(f"  Total exames: {len(exams_set)}")
    print(f"\n  Exames:")
    for e in sorted(exams_set):
        count = sum(1 for r in all_rows if f"{r['institution']}-{r['subject']}-{r['year']}" == e)
        print(f"    - {e}: {count} questoes")
    print(f"\n  Para importar:")
    print(f"    npx ts-node scripts/importExamsFromCSV.ts {OUTPUT_FILE}")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
