const logger = () => {
    console.log('gooode');
}

logger();

let body = document.querySelector('body');
let text = body.childNodes[0];
body.removeChild(text);