const svgNS = "http://www.w3.org/2000/svg";
// 라디안
const radian = angle => angle * Math.PI / 180;
// 좌표 계산
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    let angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}
// 아크 계샨
const describeArc = (x, y, radius, startAngle, endAngle) => {
    let start = polarToCartesian(x, y, radius, endAngle);
    let end = polarToCartesian(x, y, radius, startAngle);

    let largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    let d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
}
// svg text
const createSvgText = (x, y, cls, text) => {
    const txt = document.createElementNS(svgNS, 'text');
    txt.classList.add(cls);
    txt.setAttributeNS(null, 'x',x);
    txt.setAttributeNS(null, 'y',y);
    txt.setAttributeNS(null, 'text-anchor', `middle`);
    txt.setAttributeNS(null, 'dominant-baseline', `middle`);
    txt.textContent = text;
    return txt;
}

class drawChart {
    constructor () {
        this.userList = document.querySelector('.userList');
        this.userId = DATA[0].id;
        this.userData = DATA.filter(item => item.id == this.userId)[0];

        this.barGraphWrap = document.querySelector('.barGraphWrap');
        this.barGraph = this.barGraphWrap.querySelector('ul.barGraph');

        this.createList();
    }

    createList () {
        this.userList.innerHTML = '';
        
        DATA.forEach(el => {
            const li = document.createElement('li');
            li.textContent = el.name;
            li.dataset.userId = el.id;
            this.userList.append(li);
        })

        const userListLi = this.userList.querySelectorAll('li');
        userListLi.forEach(el => {
            el.addEventListener('click', () => {
                if (!el.classList.contains('active')) {
                    userListLi.forEach(el => el.classList.remove('active'));
                    el.classList.add('active');
                }
                
                this.userId = el.dataset.userId
                this.userData = DATA.filter(item => item.id === this.userId)[0];
                
                this.drawContent();
            })
        })

        userListLi[0].click();
    }

    drawBar () {
        console.log('click')
        this.barGraph.innerHTML = '';
        this.userData.subject.forEach(el => {
            const li = document.createElement('li');
            const tag = document.createElement('span');
            tag.textContent = el.courseNm;
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.width = (8 + (el.score-60)) / 48 * 100 + '%';
    
            li.append(tag);
            li.append(bar);
            this.barGraph.append(li);

            if(el.score > 92) {
                styleBackground(bar, 1);
                bar.classList.add('spanPosi');
            } else if(el.score > 84) {
                styleBackground(bar, 2);
            } else if(el.score > 76) {
                styleBackground(bar, 3);
            } else if(el.score > 68) {
                styleBackground(bar, 4);
            } else if(el.score > 60) {
                styleBackground(bar, 5);
            } else {
                styleBackground(bar, 6);
                bar.style.width = (el.score / 60 * 100 * 0.167) + '%';
            }
        })

        function styleBackground (bar, idx) {
            bar.classList.add(`barGraphColors${idx}`);
        }
    }

    drawContent () {
        this.drawBar();
    }

}

window.addEventListener('DOMContentLoaded', () => {

    new drawChart();
})
