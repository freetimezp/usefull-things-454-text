gsap.registerPlugin(SplitText, ScrollTrigger);

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const text = document.querySelector(".text");
const wrapper = document.querySelector(".wrapper");
const split = new SplitText(text, { type: "chars" });

const positions = split.chars.map((char) => ({
    left: char.offsetLeft,
    top: char.offsetTop,
}));

const wrapperRect = wrapper.getBoundingClientRect();
const textRect = text.getBoundingClientRect();

const line1X = wrapperRect.width * 0.3;
const line2X = wrapperRect.width * 0.7;
const centerY = wrapperRect.height * 0.5;

const totalChars = split.chars.length;
const charsPerLine = Math.floor(totalChars * 0.3);

const indexes = Array.from({ length: totalChars }, (_, i) => i);

for (let i = indexes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
}

const leftLineIndexes = indexes.slice(0, charsPerLine);
const rightLineIndexes = indexes.slice(charsPerLine, charsPerLine * 2);
const randomIndexes = indexes.slice(charsPerLine * 2);

leftLineIndexes.sort((a, b) => positions[b].top - positions[a].top);
rightLineIndexes.sort((a, b) => positions[b].top - positions[a].top);
randomIndexes.sort((a, b) => positions[b].top - positions[a].top);

const charData = new Array(totalChars);

leftLineIndexes.forEach((charIdx, lineIdx) => {
    charData[charIdx] = { group: "left", lineIndex: lineIdx };
});

rightLineIndexes.forEach((charIdx, lineIdx) => {
    charData[charIdx] = { group: "right", lineIndex: lineIdx };
});

const halfRandom = Math.floor(randomIndexes.length / 2);
randomIndexes.forEach((charIdx, idx) => {
    charData[charIdx] = {
        group: idx < halfRandom ? "leftBox" : "rightBox",
        randomIndex: idx < halfRandom ? idx : idx - halfRandom,
    };
});

const tl = gsap.timeline({
    scrollTrigger: {
        trigger: wrapper,
        start: "top top",
        end: "+=300%",
        scrub: 1,
        pin: true,
    },
});

const totalWidth = line2X - line1X;
const boxWidth = totalWidth / 3;
const boxHeight = charsPerLine * 15;
const boxTop = centerY - charsPerLine * 7.5;

split.chars.forEach((char, i) => {
    const data = charData[i];
    let startLeft, startTop, animationDelay;

    if (data.group === "left") {
        startLeft = line1X - (textRect.left - wrapperRect.left);
        startTop = boxTop + data.lineIndex * 15 - (textRect.top - wrapperRect.top);
        animationDelay = -data.lineIndex * 0.01;
    } else if (data.group === "right") {
        startLeft = line2X - (textRect.left - wrapperRect.left);
        startTop = boxTop + data.lineIndex * 15 - (textRect.top - wrapperRect.top);
        animationDelay = -data.lineIndex * 0.01;
    } else if (data.group === "leftBox") {
        startLeft = line1X + Math.random() * boxWidth - (textRect.left - wrapperRect.left);
        startTop = boxTop + Math.random() * boxHeight - (textRect.top - wrapperRect.top);
        animationDelay = -(charsPerLine * 0.01) + data.randomIndex * 0.01;
    } else {
        startLeft = line2X - boxWidth + Math.random() * boxWidth - (textRect.left - wrapperRect.left);
        startTop = boxTop + Math.random() * boxHeight - (textRect.top - wrapperRect.top);
        animationDelay = -(charsPerLine * 0.01) + data.randomIndex * 0.01;
    }

    gsap.set(char, {
        position: "absolute",
        left: startLeft,
        top: startTop,
    });

    tl.to(
        char,
        {
            left: positions[i].left,
            top: positions[i].top,
            ease: "power3.out",
        },
        animationDelay
    );
});
