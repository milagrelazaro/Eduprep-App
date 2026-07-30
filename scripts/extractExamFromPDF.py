#!/usr/bin/env python3
"""
Script para extrair questões de exames de PDFs usando Claude API
Gera CSV no formato do exames_modelo.xlsx do SimulaPass
"""

import os
import sys
import base64
import csv
from pathlib import Path
from anthropic import Anthropic

# Configuração
API_KEY = "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"
OUTPUT_DIR = Path("data")
OUTPUT_CSV = OUTPUT_DIR / "exames_extraidos.csv"

# Colunas do CSV (baseado no exames_modelo.xlsx)
COLUMNS = [
    "institution",
    "subject", 
    "year",
    "duration",
    "status",
    "topic",
    "question_text",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct_option",
    "explanation",
    "correct_feedback",
    "incorrect_feedback",
    "learn_more_url"
]

def encode_pdf_to_base64(pdf_path):
    """Codifica PDF em base64"""
    with open(pdf_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def extract_questions_from_pdf(pdf_path, institution, subject, year, duration=90):
    """
    Extrai questões de um PDF usando Claude API
    
    Args:
        pdf_path: Caminho do PDF
        institution: Nome da instituição (UEM, UP, UCM, etc.)
        subject: Nome da disciplina
        year: Ano do exame
        duration: Duração em minutos (padrão: 90)
    """
    client = Anthropic(api_key=API_KEY)
    
    # Codificar PDF
    pdf_base64 = encode_pdf_to_base64(pdf_path)
    
    # Prompt para Claude
    prompt = f"""
Analise este PDF de exame e extraia todas as questões de múltipla escolha.

INSTITUIÇÃO: {institution}
DISCIPLINA: {subject}
ANO: {year}
DURAÇÃO: {duration} minutos
STATUS: approved

Para cada questão, extraia:
- topic: Tópico da questão (Álgebra, Geometria, Mecânica, etc.)
- question_text: Texto completo da pergunta
- option_a: Opção A
- option_b: Opção B  
- option_c: Opção C
- option_d: Opção D
- correct_option: Índice da resposta correta (0=A, 1=B, 2=C, 3=D)
- explanation: Explicação breve do porquê da resposta
- correct_feedback: Feedback positivo para resposta correta
- incorrect_feedback: Feedback construtivo para resposta incorreta
- learn_more_url: URL opcional para mais informações (deixe vazio se não houver)

Retorne APENAS em formato CSV válido com cabeçalho:
{','.join(COLUMNS)}

Não inclua explicações adicionais. Apenas o CSV.
"""
    
    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=8192,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "document",
                            "source": {
                                "type": "base64",
                                "media_type": "application/pdf",
                                "data": pdf_base64
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        )
        
        # Extrair CSV da resposta
        csv_text = message.content[0].text
        return csv_text
        
    except Exception as e:
        print(f"Erro ao processar PDF: {e}")
        return None

def save_to_csv(csv_text, output_path):
    """Salva o CSV extraído"""
    try:
        with open(output_path, 'w', encoding='utf-8', newline='') as f:
            f.write(csv_text)
        print(f"✅ CSV salvo em: {output_path}")
        return True
    except Exception as e:
        print(f"❌ Erro ao salvar CSV: {e}")
        return False

def main():
    """Função principal"""
    if len(sys.argv) < 5:
        print("Uso: python extractExamFromPDF.py <pdf_path> <institution> <subject> <year> [duration]")
        print("Exemplo: python extractExamFromPDF.py exame_uem_2024.pdf UEM Matemática 2024 90")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    institution = sys.argv[2]
    subject = sys.argv[3]
    year = sys.argv[4]
    duration = int(sys.argv[5]) if len(sys.argv) > 5 else 90
    
    # Verificar se PDF existe
    if not os.path.exists(pdf_path):
        print(f"❌ PDF não encontrado: {pdf_path}")
        sys.exit(1)
    
    print(f"📄 Processando PDF: {pdf_path}")
    print(f"🏛️  Instituição: {institution}")
    print(f"📚 Disciplina: {subject}")
    print(f"📅 Ano: {year}")
    print(f"⏱️  Duração: {duration} minutos")
    print()
    
    # Extrair questões
    print("🔍 Extraindo questões com Claude API...")
    csv_text = extract_questions_from_pdf(pdf_path, institution, subject, year, duration)
    
    if csv_text:
        # Salvar CSV
        print("💾 Salvando CSV...")
        save_to_csv(csv_text, OUTPUT_CSV)
        print()
        print("✅ Processo concluído!")
        print(f"📁 Arquivo gerado: {OUTPUT_CSV}")
        print()
        print("Para importar no Firebase:")
        print(f"npx ts-node scripts/importExamsFromCSV.ts {OUTPUT_CSV}")
    else:
        print("❌ Falha ao extrair questões")
        sys.exit(1)

if __name__ == "__main__":
    main()
