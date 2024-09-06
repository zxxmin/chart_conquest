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

        this.halfPieGraph = document.querySelector('article.halfPieGraphWrap > .halfPieGraph');

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
            const mkDeg = (t1 + ( t2 - t1 ) / 2) % 360;
            const mk = document.createElementNS(svgNS, 'circle');
            mk.setAttribute("cx", x);
            mk.setAttribute("cy", cy);
            mk.setAttribute("r", 2);
            mk.setAttribute('style', `transform-origin:50% 50%;transform:rotate(${mkDeg}deg)`);
            g.append(mk);

            const mkLDeg = (mkDeg-90)%360;
            const mkRadian = radian(mkLDeg);
            const mkx0 = Math.cos(mkRadian) * r + x;
            const mky0 = Math.sin(mkRadian) * r + y;
            const mkx1 = Math.cos(mkRadian) * (r*1.18) + x;
            const mky1 = Math.sin(mkRadian) * (r*1.18) + y;
            let mkx2, tanchor;
            if(mkLDeg > 90 && mkLDeg < 270) {
                mkx2 = mkx1 - 6;
                tanchor = 'end';
            } else {
                mkx2 = mkx1 + 6;
                tanchor = 'start';
            }
            const mkLine = document.createElementNS(svgNS, 'polyline');
            mkLine.setAttribute('points', `${mkx0},${mky0} ${mkx1},${mky1} ${mkx2},${mky1}`);
            g.insertBefore(mkLine, mk);
            const mkTag = createSvgText(mkx2, mky1, 'tag', `${v.name} ${v.ratio}%`);
            mkTag.setAttributeNS(null, 'text-anchor', tanchor);
            g.append(mkTag);
        })

    }

    drawHalfPieGraph () {
        const svgW = 600;
        const svgH = 400;
        // const gageW = 190;
        const gageW = 330;
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttributeNS(null, 'viewBox', `0 0 ${svgW} ${svgH}`);
        this.halfPieGraph.append(svg);

        const x = svgW / 2,
              y = svgH / 2,
              cy = (svgH - gageW) / 2;

        const days = document.createElementNS(svgNS, 'g');
        days.classList.add('days');
        svg.append(days);
        const daysCont = document.createElementNS(svgNS, 'circle');
        daysCont.setAttribute("cx", x);
        daysCont.setAttribute("cy", y);
        daysCont.setAttribute("r", 80);
        days.append(daysCont);

        // 내부 글자 추가
        const freDays = Object.values(this.userData.frequentlyDays);

        const monthAver = createSvgText(x, y - 100, 'monthAver', '한 달 평균');
        days.append(monthAver);

        const montT1 = createSvgText(x, y + 105, 'montT', '학습하고 있어요');
        days.append(montT1);
        
        const dayT = createSvgText(x + 100, y + 15, 'dayT', '일');
        days.append(dayT);
        
        if (freDays.length > 0) {
            const freDaysT = createSvgText(x, y, 'freDaysT', freDays[0].ratio);
            days.append(freDaysT);
        } else {
            const noDaysT = createSvgText(x, y, 'freDaysT', '없음');
            days.append(noDaysT);
        }


        // outer pie graph
        this.userData.frequentlyDays.forEach(v => {

            const g = document.createElementNS(svgNS, 'g');
            g.classList.add('monthDay');
            svg.append(g);
            const r = gageW / 2,
                t1 = v.st + 180,
                t2 = v.et + 180,
                t3 = 330 + 180;
            const defaultGage = document.createElementNS(svgNS, 'path');
            defaultGage.classList.add('defaultGage');
            defaultGage.setAttribute("d",describeArc(x, y, r, t1, t3));
            g.append(defaultGage);

            const gage = document.createElementNS(svgNS, 'path');
            gage.classList.add('gage');
            gage.setAttribute("d",describeArc(x, y, r, t1, t2));
            g.append(gage);
        });
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

        // half pie graph
        this.halfPieGraph.innerHTML = "";

        let start = 30;

        for(let i = 0; i< this.userData.frequentlyDays.length; i++) {
            this.userData.frequentlyDays[i].st = start;
            this.userData.frequentlyDays[i].et = start + this.userData.frequentlyDays[i].ratio / 31 * 300;
        }

        this.drawHalfPieGraph();
    }

}

window.addEventListener('DOMContentLoaded', () => {

    new drawChart();
})
