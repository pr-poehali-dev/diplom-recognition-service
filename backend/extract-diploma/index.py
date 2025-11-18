import json
import os
import base64
from typing import Dict, Any
import requests
from PyPDF2 import PdfReader
from io import BytesIO

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Extract diploma data from PDF using YandexGPT
    Args: event with httpMethod, body containing base64 PDF
          context with request_id
    Returns: JSON with studentName, institution, degree, teacherName
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        pdf_base64 = body_data.get('file', '')
        
        if not pdf_base64:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'No file provided'})
            }
        
        api_key = os.environ.get('YANDEX_API_KEY')
        folder_id = os.environ.get('YANDEX_FOLDER_ID')
        
        if not api_key or not folder_id:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Yandex API key or Folder ID not configured'})
            }
        
        pdf_bytes = base64.b64decode(pdf_base64)
        pdf_file = BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        
        text = ''
        for page in reader.pages:
            text += page.extract_text() + '\n'
        
        prompt = f"""Проанализируй текст диплома и извлеки следующую информацию в JSON формате:
{{
  "studentName": "ФИО студента/участника",
  "institution": "Название образовательного учреждения",
  "degree": "Степень диплома или награды",
  "teacherName": "ФИО преподавателя/научного руководителя"
}}

Текст диплома:
{text[:4000]}

Если какое-то поле не найдено, используй "Не указано".
Верни ТОЛЬКО валидный JSON, без дополнительного текста."""
        
        url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
        headers = {
            'Authorization': f'Api-Key {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'modelUri': f'gpt://{folder_id}/yandexgpt-lite',
            'completionOptions': {
                'stream': False,
                'temperature': 0.3,
                'maxTokens': 1000
            },
            'messages': [
                {
                    'role': 'user',
                    'text': prompt
                }
            ]
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code != 200:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'YandexGPT error: {response.text}'})
            }
        
        result = response.json()
        result_text = result['result']['alternatives'][0]['message']['text'].strip()
        
        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.startswith('```'):
            result_text = result_text[3:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        
        result_json = json.loads(result_text)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(result_json, ensure_ascii=False)
        }
        
    except json.JSONDecodeError as e:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Invalid JSON: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
