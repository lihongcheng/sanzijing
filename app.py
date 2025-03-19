from flask import Flask, jsonify, render_template, send_from_directory, request
import os
import re
import json
import requests
import hashlib
from sanzijing import SANZIJING_FULL

app = Flask(__name__)

# 百度语音合成API配置
API_KEY = "XXX"
SECRET_KEY = "XXX"
CUID = "XXX"

# 定义静态资源目录
AUDIO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/audio')

# 确保音频目录存在
if not os.path.exists(AUDIO_DIR):
    os.makedirs(AUDIO_DIR)

def get_access_token():
    """
    使用 AK，SK 生成鉴权签名（Access Token）
    :return: access_token，或是None(如果错误)
    """
    url = "https://aip.baidubce.com/oauth/2.0/token"
    params = {"grant_type": "client_credentials", "client_id": API_KEY, "client_secret": SECRET_KEY}
    response = requests.post(url, params=params)
    return response.json().get("access_token")

def get_cache_filename(text):
    """
    根据文本内容生成唯一的缓存文件名
    """
    # 使用MD5哈希确保文件名的唯一性和有效性
    md5 = hashlib.md5(text.encode('utf-8')).hexdigest()
    return f"{md5}.mp3"

def check_audio_cache(text):
    """
    检查文本对应的语音缓存是否存在
    """
    filename = get_cache_filename(text)
    filepath = os.path.join(AUDIO_DIR, filename)
    if os.path.exists(filepath):
        print(f"找到缓存文件: {filename}")
        with open(filepath, 'rb') as f:
            audio_data = f.read()
        return audio_data
    return None

def save_to_cache(text, audio_data):
    """
    将语音数据保存到缓存
    """
    filename = get_cache_filename(text)
    filepath = os.path.join(AUDIO_DIR, filename)
    with open(filepath, 'wb') as f:
        f.write(audio_data)
    print(f"已保存到缓存: {filename}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/sanzijing')
def get_sanzijing():
    # 直接使用SANZIJING_FULL列表作为句子
    sentences = SANZIJING_FULL
    
    return jsonify({
        'full_text': '\n'.join(SANZIJING_FULL),  # 连接为单个字符串
        'sentences': sentences
    })

@app.route('/api/sanzijing/sentence/<int:id>')
def get_sentence(id):
    # 直接使用SANZIJING_FULL列表作为句子
    sentences = SANZIJING_FULL
    
    if id < 0 or id >= len(sentences):
        return jsonify({'error': '句子ID超出范围'}), 404
    
    sentence = sentences[id]
    
    # 提取三字组（无标点符号）
    clean_groups = []
    # 移除标点符号
    clean_sentence = sentence.replace('，', '').replace('。', '').replace('；', '').replace('！', '').replace('？', '')
    
    i = 0
    while i < len(clean_sentence):
        if i + 3 <= len(clean_sentence):
            group = clean_sentence[i:i+3]
            if group:  # 只添加非空组
                clean_groups.append(group)
        i += 3
    
    return jsonify({
        'id': id,
        'text': sentence,
        'clean_groups': clean_groups
    })

@app.route('/api/text2audio', methods=['POST'])
def text_to_audio():
    """将文本转换为语音"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': '文本不能为空'}), 400
            
        # 记录请求日志
        print(f"请求语音合成，文本: {text}")
        
        # 检查缓存中是否已经有对应的语音文件
        cached_audio = check_audio_cache(text)
        if cached_audio:
            print("使用缓存的语音文件")
            return jsonify({
                'binary': cached_audio.hex(),
                'suffix': 'mp3',
                'name': 'text2audio',
                'tips': '下载音频',
                'cached': True
            })
            
        # 尝试获取token
        try:
            access_token = get_access_token()
            if not access_token:
                print("获取百度API Token失败")
                return jsonify({'fallback': True, 'error': 'Token获取失败'}), 200
        except Exception as token_err:
            print(f"Token获取异常: {str(token_err)}")
            return jsonify({'fallback': True, 'error': f'Token异常: {str(token_err)}'}), 200
        
        # 构造百度语音合成API请求 https://cloud.baidu.com/doc/SPEECH/s/mlbxh7xie#%E5%9C%A8%E7%BA%BF%E8%B0%83%E8%AF%95%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81
        url = "https://tsn.baidu.com/text2audio"
        
        payload = {
            'tok': access_token,
            'tex': text,#合成的文本，文本长度必须小于1024GBK字节。建议每次请求文本不超过120字节，约为60个汉字或者字母数字。
            'cuid': CUID,
            'ctp': 1,#客户端类型选择，web端填写固定值1
            'lan': 'zh',
            'spd': 3,  # 语速，取值0-15，默认为5中语速
            'pit': 5,  #音调，取值0-15，默认为5中语调
            'vol': 7,  #音量，基础音库取值0-9，精品音库取值0-15，默认为5中音量（取值为0时为音量最小值，并非为无声）
            'per': 4,  # 度小宇=1，度小美=0，度逍遥（基础）=3，度丫丫=4
            'aue': 3   # mp3格式
        }
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*'
        }
        
        # 发送请求获取语音数据
        print("发送百度API请求...")
        try:
            response = requests.post(url, headers=headers, data=payload)
            
            print(f"百度API响应状态码: {response.status_code}")
            print(f"百度API响应内容类型: {response.headers.get('Content-Type')}")
            
            # 检查响应是否为音频
            if response.headers.get('Content-Type') == 'audio/mp3':
                # 保存到缓存
                save_to_cache(text, response.content)
                
                # 直接返回音频二进制数据
                print("成功获取语音数据并缓存")
                return jsonify({
                    'binary': response.content.hex(),
                    'suffix': 'mp3',
                    'name': 'text2audio',
                    'tips': '下载音频',
                    'cached': False
                })
            else:
                # 如果返回的是错误信息
                error_detail = ""
                try:
                    error_detail = response.json()
                    # 检查是否是API限制错误
                    if isinstance(error_detail, dict) and error_detail.get('err_msg', '').find('Open api characters limit reached') >= 0:
                        print(f"API限额已用尽: {error_detail}")
                        return jsonify({'fallback': True, 'limitReached': True, 'error': 'API限额已用尽'}), 200
                except:
                    error_detail = response.text[:100]
                
                print(f"API返回非音频内容: {error_detail}")
                return jsonify({'fallback': True, 'error': f'API错误: {error_detail}'}), 200
                
        except Exception as req_err:
            print(f"API请求异常: {str(req_err)}")
            return jsonify({'fallback': True, 'error': f'请求异常: {str(req_err)}'}), 200
            
    except Exception as e:
        print(f"语音合成整体异常: {str(e)}")
        return jsonify({'fallback': True, 'error': str(e)}), 200

# 获取已缓存的语音文件列表
@app.route('/api/audio/cached')
def get_cached_audio():
    """获取已缓存的语音文件列表"""
    try:
        files = os.listdir(AUDIO_DIR)
        mp3_files = [f for f in files if f.endswith('.mp3')]
        return jsonify({
            'count': len(mp3_files),
            'files': mp3_files
        })
    except Exception as e:
        return jsonify({'error': f'获取缓存文件列表失败: {str(e)}'}), 500

@app.route('/get_cache_count')
def get_cache_count():
    try:
        count = len(os.listdir(AUDIO_DIR))
        return jsonify({'count': count})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/clear_cache', methods=['POST'])
def clear_cache():
    try:
        for filename in os.listdir(AUDIO_DIR):
            file_path = os.path.join(AUDIO_DIR, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 静态音频文件服务
@app.route('/static/audio/<path:filename>')
def serve_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0') 