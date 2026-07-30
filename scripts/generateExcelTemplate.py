"""
Script para gerar modelo Excel (.xlsx) para importação de exames
Uso: python scripts/generateExcelTemplate.py
"""

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def create_excel_template():
    # Criar workbook
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Modelo de Exames"
    
    # Estilos
    header_font = Font(name='Arial', size=11, bold=True, color='FFFFFF')
    header_fill = PatternFill(start_color='4472C4', end_color='4472C4', fill_type='solid')
    instruction_font = Font(name='Arial', size=10, color='FF0000', bold=True)
    example_font = Font(name='Arial', size=10, color='666666', italic=True)
    data_font = Font(name='Arial', size=10)
    
    thin_border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    
    # Instruções no topo
    instructions = [
        "INSTRUÇÕES:",
        "1. Preencha as células abaixo com os dados dos exames",
        "2. Cada linha representa uma QUESTÃO",
        "3. Os campos do EXAME (instituição, disciplina, etc.) se repetem para cada questão do mesmo exame",
        "4. NÃO altere a linha de cabeçalho (linha 7)",
        "5. Salve como CSV (UTF-8) antes de importar",
        "6. Use o script: npx ts-node scripts/importExamsFromCSV.ts data/exames_modelo.xlsx",
        "",
        "IMPORTANTE: Campos com * são obrigatórios"
    ]
    
    for i, instruction in enumerate(instructions, 1):
        cell = ws.cell(row=i, column=1, value=instruction)
        cell.font = instruction_font if i == 1 else Font(name='Arial', size=9, color='333333')
    
    # Cabeçalhos
    headers = [
        "institution*",
        "subject*",
        "year*",
        "duration*",
        "status*",
        "topic",
        "question_text*",
        "option_a*",
        "option_b*",
        "option_c*",
        "option_d*",
        "correct_option*",
        "explanation",
        "correct_feedback",
        "incorrect_feedback",
        "learn_more_url"
    ]
    
    header_row = 8
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=header_row, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        cell.border = thin_border
    
    # Descrições dos campos (linha abaixo do cabeçalho)
    descriptions = [
        "Instituição (UEM, UP, UCM, ISCTEM, Unilúrio, UniZambeze)",
        "Disciplina (Matemática, Física, Química, Biologia, Português, etc.)",
        "Ano do exame (ex: 2024)",
        "Duração em minutos (ex: 90)",
        "Status (approved, pending, rejected)",
        "Tópico da questão (opcional)",
        "Texto da pergunta",
        "Opção A",
        "Opção B",
        "Opção C",
        "Opção D",
        "Índice correto (0=A, 1=B, 2=C, 3=D)",
        "Explicação da resposta (opcional)",
        "Feedback correto (opcional)",
        "Feedback incorreto (opcional)",
        "URL para mais info (opcional)"
    ]
    
    desc_row = header_row + 1
    for col, desc in enumerate(descriptions, 1):
        cell = ws.cell(row=desc_row, column=col, value=desc)
        cell.font = Font(name='Arial', size=8, color='666666', italic=True)
        cell.alignment = Alignment(horizontal='center', vertical='top', wrap_text=True)
        cell.border = thin_border
    
    # Exemplo 1: Matemática UEM
    example_row = desc_row + 2
    ws.cell(row=example_row, column=1, value="UEM").font = example_font
    ws.cell(row=example_row, column=2, value="Matemática").font = example_font
    ws.cell(row=example_row, column=3, value="2024").font = example_font
    ws.cell(row=example_row, column=4, value="90").font = example_font
    ws.cell(row=example_row, column=5, value="approved").font = example_font
    ws.cell(row=example_row, column=6, value="Álgebra").font = example_font
    ws.cell(row=example_row, column=7, value="Qual é o valor de x na equação 2x + 5 = 15?").font = example_font
    ws.cell(row=example_row, column=8, value="5").font = example_font
    ws.cell(row=example_row, column=9, value="10").font = example_font
    ws.cell(row=example_row, column=10, value="7.5").font = example_font
    ws.cell(row=example_row, column=11, value="3").font = example_font
    ws.cell(row=example_row, column=12, value="0").font = example_font
    ws.cell(row=example_row, column=13, value="Para resolver: 2x + 5 = 15 → 2x = 10 → x = 5").font = example_font
    ws.cell(row=example_row, column=14, value="Correto! Você isolou a variável.").font = example_font
    ws.cell(row=example_row, column=15, value="Incorreto. Lembre-se de isolar x.").font = example_font
    
    # Exemplo 2: Física UP
    example_row += 1
    ws.cell(row=example_row, column=1, value="UP").font = example_font
    ws.cell(row=example_row, column=2, value="Física").font = example_font
    ws.cell(row=example_row, column=3, value="2024").font = example_font
    ws.cell(row=example_row, column=4, value="90").font = example_font
    ws.cell(row=example_row, column=5, value="approved").font = example_font
    ws.cell(row=example_row, column=6, value="Mecânica").font = example_font
    ws.cell(row=example_row, column=7, value="Qual é a fórmula da força?").font = example_font
    ws.cell(row=example_row, column=8, value="F = m × a").font = example_font
    ws.cell(row=example_row, column=9, value="F = m × v").font = example_font
    ws.cell(row=example_row, column=10, value="F = m × g").font = example_font
    ws.cell(row=example_row, column=11, value="F = p × v").font = example_font
    ws.cell(row=example_row, column=12, value="0").font = example_font
    ws.cell(row=example_row, column=13, value="Segunda Lei de Newton").font = example_font
    ws.cell(row=example_row, column=14, value="Correto! Você domina as leis de Newton.").font = example_font
    ws.cell(row=example_row, column=15, value="Incorreto. Lembre-se da Segunda Lei.").font = example_font
    
    # Linha separadora
    separator_row = example_row + 1
    ws.cell(row=separator_row, column=1, value="═══════════════════════════════════════════════════════════════════════════════").font = Font(name='Arial', size=10, color='4472C4', bold=True)
    
    # Linhas em branco para preenchimento (20 linhas)
    data_start_row = separator_row + 1
    for row in range(data_start_row, data_start_row + 20):
        for col in range(1, 17):
            cell = ws.cell(row=row, column=col)
            cell.border = thin_border
            cell.font = data_font
    
    # Ajustar largura das colunas
    column_widths = [15, 15, 10, 10, 12, 15, 50, 20, 20, 20, 20, 15, 40, 30, 30, 30]
    for col, width in enumerate(column_widths, 1):
        ws.column_dimensions[get_column_letter(col)].width = width
    
    # Ajustar altura das linhas
    ws.row_dimensions[header_row].height = 30
    ws.row_dimensions[desc_row].height = 60
    
    # Congelar painel no cabeçalho
    ws.freeze_panes = 'A9'
    
    # Salvar arquivo
    output_path = 'data/exames_modelo.xlsx'
    wb.save(output_path)
    print(f"✅ Modelo Excel criado: {output_path}")
    print(f"📊 {16} colunas, {data_start_row + 19} linhas")
    print(f"📝 20 linhas disponíveis para preenchimento")
    print(f"\n🚀 Para importar:")
    print(f"   1. Abra o arquivo no Excel")
    print(f"   2. Preencha com os dados dos exames")
    print(f"   3. Salve como CSV (UTF-8)")
    print(f"   4. Execute: npx ts-node scripts/importExamsFromCSV.ts data/exames_modelo.csv")

if __name__ == "__main__":
    try:
        create_excel_template()
    except ImportError:
        print("❌ Erro: Biblioteca openpyxl não instalada")
        print("📦 Instale com: pip install openpyxl")
    except Exception as e:
        print(f"❌ Erro ao criar modelo Excel: {e}")
