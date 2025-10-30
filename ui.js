let typingTimer;

function createMatrixEffect() {
    const container = document.getElementById('matrixBg');
    if (!container) return;
    const symbols = ['0','1','{','}','(',')','[',']','<','>','/','\\','|','&','%','$','#','@','*','+','-','=','?','!','^','~','`',':',';',',','.','def','var','int','str','if','for','while','class','function'];
    const hieroglyphs = ['𓂀','𓂁','𓂂','𓂃','𓂄','𓂅','𓂆','𓂇','𓂈','𓂉','𓂊','𓂋','𓂌','𓂍','𓂎','𓂏','𓁶','𓁷','𓁸','𓁹','𓁺','𓁻','𓁼','𓁽','𓁾','𓁿','𓀀','𓀁','𓀂','𓀃','𓀄','𓀅','𓀆','𓀇','𓀈','𓀉','𓀊','𓀋','𓀌','𓀍','𓀎','𓀏','𓃀','𓃁','𓃂','𓃃','𓃄','𓃅','𓃆','𓃇','𓃈','𓃉','𓃊','𓃋','𓃌','𓃍','𓃎','𓃏'];

    function createSymbol() {
        if (container.children.length > 25) return;
        const symbol = document.createElement('div');
        symbol.className = 'symbol';
        symbol.textContent = Math.random() > 0.7 
            ? hieroglyphs[Math.floor(Math.random() * hieroglyphs.length)]
            : symbols[Math.floor(Math.random() * symbols.length)];
        symbol.style.left = Math.random() * 100 + '%';
        symbol.style.animationDuration = (Math.random() * 6 + 4) + 's';
        symbol.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(symbol);
        setTimeout(() => { if (symbol.parentNode) symbol.parentNode.removeChild(symbol); }, 10000);
    }
    setInterval(createSymbol, 500);
}
createMatrixEffect();

const hieroglyphChars = ['𓂀','𓂁','𓂂','𓂃','𓂄','𓂅','𓂆','𓂇','𓂈','𓂉','𓂊','𓂋','𓂌','𓂍','𓂎','𓂏','𓃀','𓃁','𓃂','𓃃','𓃄','𓃅','𓃆','𓃇','𓃈','𓃉','𓃊','𓃋','𓃌','𓃍','𓃎','𓃏'];

function setupInputAnimations() {
    const inputs = [
        { inputId: 'loginUser',        overlayId: 'loginUserOverlay' },
        { inputId: 'loginPassword',    overlayId: 'loginPasswordOverlay' },
        { inputId: 'regName',          overlayId: 'regNameOverlay' },
        { inputId: 'regEmail',         overlayId: 'regEmailOverlay' },
        { inputId: 'regPhotoURL',      overlayId: 'regPhotoURLOverlay' },
        { inputId: 'regPassword',      overlayId: 'regPasswordOverlay' }
    ];
    inputs.forEach(({ inputId, overlayId }) => {
        const inputElement = document.getElementById(inputId);
        const overlayElement = document.getElementById(overlayId);
        if (inputElement && overlayElement) {
            inputElement.addEventListener('input', function (e) {
                clearTimeout(typingTimer);
                const value = e.target.value;

                if (value.length > 0) {
                    inputElement.style.color = 'transparent';
                    overlayElement.style.opacity = '1';

                    if (e.inputType === 'deleteContentBackward') {
                        overlayElement.textContent = overlayElement.textContent.slice(0, -1);
                    } else {
                        overlayElement.textContent += hieroglyphChars[Math.floor(Math.random() * hieroglyphChars.length)];
                    }

                    typingTimer = setTimeout(() => {
                        overlayElement.style.opacity = '0';
                        inputElement.style.color = '#ffd700';
                    }, 1000);

                } else {
                    inputElement.style.color = '#ffd700';
                    overlayElement.style.opacity = '0';
                    overlayElement.textContent = '';
                }
            });
        }
    });
}
setupInputAnimations();