document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const playBtn = document.getElementById('play-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const progressEl = document.getElementById('progress');
    const characterDisplay = document.querySelector('.character-display');
    const characterMeaning = document.querySelector('.character-meaning');
    
    // 应用状态
    let currentSentenceIndex = 0;
    let sanzijingData = null;
    let currentCleanGroups = []; // 当前句子的三字组（无标点）
    
    // 音频元素
    let audioElement = new Audio();
    
    // 三字经解释（适合儿童理解的简化版本）
    const explanations = [
        "人刚出生的时候，本性都是善良的。人的本性都很相似，但是因为后天的学习环境不同，所以会变得不一样。",
        "如果不好好教育，天性就会变坏。教育的方法，最重要的是要专一认真。",
        "从前的孟子的妈妈，为了让孟子好好学习，特意选择了好的邻居搬家。孟子不好好学习时，孟妈妈就把织布的机器弄坏，教育他学习的重要性。",
        "古代的窦燕山用很好的方法教育他的五个儿子，他们都很有名气。",
        "养育孩子但不教育，是做父亲的过错。教育孩子但不严格，是做老师的懒惰。",
        "做儿子的如果不学习，是不应该的。小时候不学习，长大了就没用了。",
        "玉石如果不雕琢，就不能成为好的器物。人如果不学习，就不懂得道理。",
        "作为孩子，在年幼的时候，就应该亲近老师和朋友，学习礼仪。",
        "黄香九岁的时候，知道在冬天暖和父亲的被窝，在夏天为父亲扇凉席。孝顺父母是应该做的。",
        "孔融四岁时，就知道把大的梨子让给哥哥。尊敬长辈是应该先懂得的。",
        "首先要学习孝顺父母和友爱兄弟，然后才是学习知识，知道一些数字和文字。",
        "从一到十，从十到百，从百到千，从千到万，这样数字越来越大。",
        "三才是指天、地、人。三光是指日、月、星。",
        "三纲是指君臣有义、父子有亲、夫妇有顺。这是古代人际关系的基本原则。",
        "春、夏、秋、冬是四季，它们周而复始，循环不止。",
        "南、北、西、东是四个方向，它们以中央为参照点。",
        "水、火、木、金、土是五行，它们的变化有规律可循。",
        "天干有十个：甲、乙、丙、丁、戊、己、庚、辛、壬、癸。地支有十二个：子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥。",
        "黄道是太阳运行的轨道。赤道是地球中央的水平线。",
        "赤道附近地区非常温暖。我们中国位于地球的东北部。",
        "江、河、淮、济是中国古代重要的四条大河，是水的记录。",
        "泰山、华山、嵩山、恒山、衡山是中国的五座名山，被称为五岳。",
        "士人、农民、工匠、商人是社会上的四种职业，是国家的栋梁。",
        "仁、义、礼、智、信是五种道德规范，不能混乱。",
        "地上生长着各种草和树木，这些植物生长在水里和陆地上。",
        "有虫子和鱼，有鸟类和兽类，这些动物能飞能走。",
        "稻子、小米、豆子、麦子、黄米、谷子是六种谷物，是人们食用的。",
        "马、牛、羊、鸡、狗、猪是六种家畜，是人们饲养的。",
        "喜、怒、哀、惧、爱、恶、欲是人的七种情感，人人都有。",
        "青、红、黄、黑、白是五种颜色，是眼睛能够分辨的。",
        "酸、苦、甜、辣、咸是五种味道，是嘴巴能够品尝的。",
        "膻、焦、香、腥、朽是五种气味，是鼻子能够嗅到的。",
        "葫芦丝、土鼓、皮革、木头、石头、金属、丝弦、竹子是八种乐器的材料。",
        "平声、上声、去声、入声是古代汉语的四种声调，要和谐地发音。",
        "高祖、曾祖、祖父、父亲、自己、儿子、孙子，是一家的七代人。",
        "从子孙到玄孙和曾孙，构成九族，是人伦的范围。",
        "父子之间有恩情，夫妻之间要相随。兄长对弟弟要友爱，弟弟对兄长要恭敬。",
        "长辈和晚辈有秩序，朋友之间要有义气。对君主要尊敬，做臣子要忠诚。",
        "这十种道义人人都应该遵守，要按照顺序学习，不要违背。",
        "古代丧服有不同等级：斩衰、齐衰、大功、小功、缌麻，这五种服制有明确规定。",
        "礼、乐、射、御、书、数是古代的六种学问和技能，现在已经不完整了。",
        "现在大家都遵循的是书本上的学问。认识了字后，就要学习解释文字的意思。",
        "古代有不同的文字：古文、大篆、小篆、隶书、草书，不能混淆。",
        "如果学习面太广，会担心太繁杂。但略微讲解一下，就能明白其中的道理。",
        "教导孩子要认真研究，详细解释文字含义，明白句子的读法。",
        "学习的人必须有入门课程。小学课程学完后，就要学习四书。",
        "《论语》共有二十篇，记录了孔子弟子们记下的孔子的好话。",
        "《孟子》有七篇，讲的是道德和仁义的道理。",
        "《中庸》是孔子的孙子子思写的，表达了中不偏、庸不变的道理。",
        "《大学》是曾子写的，从修身齐家一直讲到治国平天下。",
        "《孝经》学通了，四书也熟悉了，然后才可以读六经。",
        "诗、书、易、礼、春秋是六经，应该认真学习研究。",
        "连山易、归藏易、周易是三部《易经》，都很详细。",
        "典、谟、训、诰、誓、命是《尚书》的六种体裁，内容深奥。",
        "周公制定了周礼，设立六种官职，保存了治国的制度。",
        "戴德和戴圣注解的《礼记》，记述了圣人的言行，礼乐制度很完备。",
        "国风、雅、颂是《诗经》的四部分，应该诵读歌唱。",
        "《诗经》失传后，《春秋》出现了，寄托了褒贬，区分了善恶。",
        "解释《春秋》的有《公羊传》、《左传》、《谷梁传》三种。",
        "经书学明白了，才能读诸子百家的书。摘取其中的要点，记下重要的事情。",
        "五子是指荀子、杨雄、王通、老子、庄子等思想家。",
        "经书和诸子百家的书都学通了，就可以读历史书了。研究历史世系，了解历史的始末。",
        "从伏羲、神农到黄帝，被称为三皇，是上古时代的君主。",
        "唐尧、虞舜被称为二帝，他们互相谦让禅位，是太平盛世。",
        "夏朝的禹、商朝的汤、周朝的武王被称为三王，都是贤明的君主。",
        "夏朝把王位传给儿子，形成家天下。统治了四百年，后来亡国迁都。",
        "商汤灭了夏朝，国号为商。统治了六百年，到商纣王时灭亡。",
        "周武王开始诛杀商纣王。周朝统治了八百年，是最长久的朝代。",
        "周王室东迁后，王权衰落。诸侯争战不断，喜欢游说之士。",
        "从春秋到战国时期，出现了五霸和七雄等强国。",
        "秦国开始统一六国。传到二世时，爆发了楚汉相争。",
        "汉高祖刘邦兴起，建立了汉朝。到汉孝平帝时，王莽篡位。",
        "光武帝重新兴起，建立东汉。统治了四百年，最后亡于汉献帝。",
        "魏国、蜀国、吴国争夺汉朝的天下。这段时期被称为三国，后来是两晋。",
        "宋、齐、梁、陈相继建立。被称为南朝，都城在金陵（今南京）。",
        "北方有北魏，后来分为东魏和西魏。还有宇文周和高齐等政权。",
        "到了隋朝，统一了全国。但隋朝只传了两代就失去了统治权。",
        "唐高祖举起义旗，平定隋朝的混乱，创建了唐朝的基业。",
        "唐朝传了二十代，统治了三百年。后梁灭了唐朝，国号改变了。",
        "梁、唐、晋、汉、周五个朝代，被称为五代，都有各自的缘由。",
        "宋朝兴起，接受了后周的禅让。传了十八代，经历了南北混战。",
        "辽国和金国都自称为帝国。元朝灭了金国，结束了宋朝。",
        "元朝的疆域广大，超过了以前的朝代。但只统治了九十年就灭亡了。",
        "明太祖朱元璋兴起，国号大明。年号洪武，定都金陵（今南京）。",
        "到了明成祖时，迁都到北京。明朝传了十六代，到崇祯帝时灭亡。",
        "宦官专权，盗贼四起。李自成起义，明朝的国器被焚毁。",
        "清世祖顺应天命，平定四方，建立了大清帝国。",
        "从康熙、雍正到乾隆、嘉庆，人民安居乐业，政绩显著。",
        "道光、咸丰年间，变乱四起。英国和法国开始侵扰中国。",
        "同治、光绪之后，宣统皇帝年幼。清朝传了九代皇帝后灭亡。",
        "辛亥革命兴起，废除了帝制。制定宪法，建立了中华民国。",
        "古今的历史都记载在这里。记录了治乱兴衰的历程。",
        "历史虽然繁多，但阅读有次序。先读《史记》，再读《汉书》。",
        "然后是《后汉书》、《三国志》。还要参考经书和《资治通鉴》。",
        "读历史的人要考证真实的记录。了解古今，就像亲眼所见一样。",
        "口中诵读，心里思考。早晨学习，晚上也学习。",
        "孔子曾经向项橐学习。古代的圣贤都勤奋好学。",
        "赵普读《论语》。他虽然已经做了官，但仍然勤奋学习。",
        "编织蒲草做书，削竹子做简牍。古人没有书，但知道勉励自己学习。",
        "孙敬头悬梁避免睡着，苏秦锥刺大腿使自己清醒。他们没有人教导，但自己努力学习。",
        "车胤把萤火虫装在袋子里当灯读书，孙康利用雪地的反光读书。家虽然贫穷，但不停止学习。",
        "朱买臣背着柴火读书，李密头上挂着牛角提醒自己读书。身体虽然劳累，但仍然刻苦学习。",
        "苏洵（号老泉）二十七岁才开始发愤读书。",
        "他年纪已大，还后悔开始得太晚。你们年轻人应该早点想到这一点。",
        "梁灏八十二岁在殿试中得了第一名。",
        "他已经成功了，大家都称赞他不平凡。你们年轻人应该立下志向。",
        "李泌八岁能写诗，李泌七岁能下棋。",
        "他们聪明悟性好，人们称他们很奇特。你们年幼的学生应当效法他们。",
        "蔡文姬能辨别琴音，谢道韫能即兴吟诗。",
        "这些女子尚且这么聪明。你们男子更应该警醒自己。",
        "唐朝的刘晏七岁时就被举荐为神童，任命为正字。",
        "刘晏虽然年幼，但已经做了官。有作为的人也应该这样。",
        "狗在夜里看家，鸡在早晨报晓。如果人不学习，怎么算是人呢？",
        "蚕吐丝，蜜蜂酿蜜。人如果不学习，连这些小动物都不如。",
        "年轻时学习，长大后实践。上可以辅佐君主，下可以造福百姓。",
        "扬名声，显耀父母。使前代光荣，让后代富足。",
        "别人留给子孙的是满箱的金银财宝。我教给子孙的只有这一部经书。",
        "勤奋有成效，玩耍没有益处。告诫你们，应当努力啊！"
    ];
    
    // 获取三字经数据
    async function fetchSanzijingData() {
        try {
            const response = await fetch('/api/sanzijing');
            const data = await response.json();
            sanzijingData = data;
            renderCurrentSentence();
        } catch (error) {
            console.error('获取三字经数据失败:', error);
            characterDisplay.innerHTML = '<p class="error">加载失败，请刷新页面重试</p>';
        }
    }
    
    // 获取特定句子
    async function fetchSentence(sentenceId) {
        try {
            const response = await fetch(`/api/sanzijing/sentence/${sentenceId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`获取句子 ${sentenceId} 失败:`, error);
            return null;
        }
    }
    
    // 渲染当前句子
    async function renderCurrentSentence() {
        if (!sanzijingData) return;
        
        // 获取当前句子的详细信息
        const sentenceData = await fetchSentence(currentSentenceIndex);
        if (!sentenceData) return;
        
        // 保存当前句子的三字组
        currentCleanGroups = sentenceData.clean_groups;
        
        // 更新进度
        progressEl.textContent = `${currentSentenceIndex + 1}/${sanzijingData.sentences.length}`;
        
        // 清空显示区域
        characterDisplay.innerHTML = '';
        
        // 添加每个三字组到显示区域
        currentCleanGroups.forEach((group, index) => {
            const groupEl = document.createElement('div');
            groupEl.classList.add('character');
            groupEl.textContent = group;
            groupEl.dataset.index = index;
            
            // 点击三字组播放发音
            groupEl.addEventListener('click', () => {
                speakText(group);
                highlightCharacter(groupEl);
            });
            
            characterDisplay.appendChild(groupEl);
        });
        
        // 显示解释（如果有）
        if (currentSentenceIndex < explanations.length) {
            characterMeaning.textContent = explanations[currentSentenceIndex];
        } else {
            characterMeaning.textContent = ""; // 没有解释时留空
        }
    }
    
    // 高亮显示当前字符
    function highlightCharacter(element) {
        // 移除所有活跃状态
        document.querySelectorAll('.character').forEach(el => {
            el.classList.remove('active');
        });
        
        // 添加活跃状态
        element.classList.add('active');
        
        // 1秒后移除高亮
        setTimeout(() => {
            element.classList.remove('active');
        }, 1000);
    }
    
    // 将文本转换为语音并播放
    async function speakText(text) {
        try {
            // 停止之前的音频
            if (window.speechSynthesis && window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
            
            // 检查是否已经知道API限额用尽
            if (window.baiduApiLimitReached) {
                console.log('百度API限额已用尽，直接使用浏览器语音合成');
                useBrowserSpeech(text);
                return;
            }
            
            console.log(`尝试使用百度语音合成API: ${text}`);
            
            // 调用后端API生成语音
            const response = await fetch('/api/text2audio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            
            if (!response.ok && response.status !== 200) {
                console.error(`API请求失败: ${response.status}`);
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 检查是否需要回退到浏览器语音
            if (data.fallback) {
                console.log(`需要回退到浏览器语音: ${data.error}`);
                
                // 如果是由于API限额达到限制，记录这个状态避免后续请求
                if (data.limitReached) {
                    console.log('检测到API限额已用尽，后续将直接使用浏览器语音合成');
                    window.baiduApiLimitReached = true;
                }
                
                useBrowserSpeech(text);
                return;
            }
            
            if (data.binary) {
                // 将二进制字符串转换为ArrayBuffer
                const binaryString = data.binary;
                const bytes = new Uint8Array(binaryString.length / 2);
                for (let i = 0; i < binaryString.length; i += 2) {
                    bytes[i / 2] = parseInt(binaryString.substring(i, i + 2), 16);
                }
                
                // 创建Blob对象
                const blob = new Blob([bytes], { type: 'audio/mp3' });
                
                // 设置音频源并播放
                const audioUrl = URL.createObjectURL(blob);
                audioElement.src = audioUrl;
                
                // 播放完成后释放URL对象
                audioElement.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                };
                
                // 播放音频
                console.log('开始播放百度合成的语音');
                await audioElement.play().catch(error => {
                    console.error('音频播放失败:', error);
                    useBrowserSpeech(text);
                });
            } else {
                console.error('响应中没有音频数据');
                useBrowserSpeech(text);
            }
        } catch (error) {
            console.error('语音播放失败:', error);
            useBrowserSpeech(text);
        }
    }
    
    // 使用浏览器内置语音合成
    function useBrowserSpeech(text) {
        try {
            console.log(`使用浏览器语音合成: ${text}`);
            
            if (!window.speechSynthesis) {
                throw new Error('浏览器不支持语音合成API');
            }
            
            // 使用浏览器内置语音合成
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            
            // 获取可用的声音列表
            let voices = window.speechSynthesis.getVoices();
            
            // 如果声音列表为空，可能是因为尚未加载完成
            if (voices.length === 0) {
                // 尝试等待声音加载完成
                window.speechSynthesis.onvoiceschanged = function() {
                    voices = window.speechSynthesis.getVoices();
                    setVoiceAndSpeak();
                };
            } else {
                setVoiceAndSpeak();
            }
            
            function setVoiceAndSpeak() {
                // 尝试找到中文声音
                const chineseVoice = voices.find(voice => 
                    voice.lang.includes('zh') || voice.lang.includes('cmn')
                );
                
                if (chineseVoice) {
                    utterance.voice = chineseVoice;
                    console.log(`使用中文语音: ${chineseVoice.name}`);
                }
                
                // 对于短句添加间隔使朗读更自然
                if (text.length <= 3) {
                    utterance.text = text.split('').join(' ');
                }
                
                // 调整语速使其更适合儿童
                utterance.rate = 0.8;
                
                // 播放语音
                window.speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.error('浏览器语音合成失败:', error);
            alert('您的浏览器不支持语音功能，请使用Chrome、Firefox或Safari等现代浏览器。');
        }
    }
    
    // 播放当前整句
    function playCurrentSentence() {
        if (!sanzijingData) return;
        
        const currentSentence = sanzijingData.sentences[currentSentenceIndex];
        speakText(currentSentence);
        
        // 依次高亮每个三字组
        const characters = document.querySelectorAll('.character');
        let index = 0;
        
        // 清除之前的定时器
        if (window.highlightInterval) {
            clearInterval(window.highlightInterval);
        }
        
        // 设置新的定时器
        window.highlightInterval = setInterval(() => {
            if (index < characters.length) {
                highlightCharacter(characters[index]);
                index++;
            } else {
                clearInterval(window.highlightInterval);
            }
        }, 1000); // 每秒高亮一个三字组
    }
    
    // 上一句
    function prevSentence() {
        if (currentSentenceIndex > 0) {
            currentSentenceIndex--;
            renderCurrentSentence();
        }
    }
    
    // 下一句
    function nextSentence() {
        if (sanzijingData && currentSentenceIndex < sanzijingData.sentences.length - 1) {
            currentSentenceIndex++;
            renderCurrentSentence();
        }
    }
    
    // 事件监听
    prevBtn.addEventListener('click', prevSentence);
    nextBtn.addEventListener('click', nextSentence);
    playBtn.addEventListener('click', playCurrentSentence);
    repeatBtn.addEventListener('click', playCurrentSentence);
    
    // 键盘导航
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowLeft':
                prevSentence();
                break;
            case 'ArrowRight':
                nextSentence();
                break;
            case ' ':
                playCurrentSentence();
                break;
        }
    });
    
    // 初始化页面
    fetchSanzijingData();
}); 