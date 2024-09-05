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

        this.pieGraph = document.querySelector('article.pieGraphWrap > .pieGraph');

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

    drawPieGraph () {
        const svgW = 400;
        const svgH = 260;
        const gageW = 190;
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttributeNS(null, 'viewBox', `0 0 ${svgW} ${svgH}`);
        this.pieGraph.append(svg);

        const x = svgW / 2,
              y = svgH / 2,
              cy = (svgH - gageW) / 2;

        // inner pie graph
        const time = document.createElementNS(svgNS, 'g');
        time.classList.add('time');
        svg.append(time);
        const timgCon = document.createElementNS(svgNS, 'circle');
        timgCon.setAttribute("cx", x);
        timgCon.setAttribute("cy", y);
        timgCon.setAttribute("r", 65);
        time.append(timgCon);

        // 글자넣기
        const freTime = Object.values(this.userData.frequentlyTime);

        const makeTxt = (num, time1, time2) => {
            const timeT1 = createSvgText(x, y - num, 'timeT', `자주 활용하는`);
            const timeT2 = createSvgText(x, y - num + 15, 'timeT', `시간대`);
            time.append(timeT1);
            time.append(timeT2);

            if(freTime.length === 2) {
                const timeTxt1 = createSvgText(x, y + 10, 'timeTxt', time1);
                const timeTxt2 = createSvgText(x, y + 10 + 20, 'timeTxt', time2);
                time.append(timeTxt1);
                time.append(timeTxt2);
            } else {
                const timeTxt1 = createSvgText(x, y + 20, 'timeTxt', time1);
                time.append(timeTxt1);
            }
        }

        if (freTime.length === 2) {
            const fretime1 = Object.values(freTime[0]);
            const jointime1 = fretime1.join('');
            const fretime2 = Object.values(freTime[1]);
            const jointime2 = fretime2.join('');
            makeTxt(25, jointime1, jointime2);

        } else if (freTime.length === 1) {
            const fretime1 = Object.values(freTime[0]);
            const jointime1 = fretime1.join('');
            makeTxt(15, jointime1);

        } else if (freTime.length === 0) {
            makeTxt(15, `없음`);
        }


        // outer pie graph
        this.userData.utilization.forEach(v => {
            const g = document.createElementNS(svgNS, 'g');
            g.classList.add(v.cls);
            svg.append(g);
            const r = gageW / 2,
                t1 = v.st + 180,
                t2 = v.et + 180;

            const gage = document.createElementNS(svgNS, 'path');
            gage.classList.add('gage');
            gage.setAttribute("d",describeArc(x, y, r, t1, t2));
            g.append(gage);
        })

    }

    drawContent () {
        this.drawBar();

        // pie graph
        this.pieGraph.innerHTML = '';

        let st = 90;

        for(let i = 0; i< this.userData.utilization.length; i++) {
            this.userData.utilization[i].cls = this.userData.utilization[i].id;
            this.userData.utilization[i].st = st;
            this.userData.utilization[i].et = st + this.userData.utilization[i].ratio / 100 * 360;
            st = this.userData.utilization[i].et;
        }

        this.drawPieGraph();
    }

}

window.addEventListener('DOMContentLoaded', () => {

    new drawChart();
})
