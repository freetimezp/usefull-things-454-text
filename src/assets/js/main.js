gsap.registerPlugin(SplitText, ScrollTrigger);

/* -------------------------------------------------------
   LENIS
------------------------------------------------------- */

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

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

/* -------------------------------------------------------
   FIRST SECTION — YOUR ORIGINAL TEXT ANIMATION
------------------------------------------------------- */

const text = document.querySelector(".text");
const wrapper = document.querySelector(".wrapper");

const split = new SplitText(text, {
    type: "chars",
});

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

/* -------------------------------------------------------
   HERO LABEL
------------------------------------------------------- */

gsap.from(".hero-label", {
    y: 20,
    opacity: 0,
    duration: 1,
    delay: 0.5,
    ease: "power3.out",
});

/* shuffle */

for (let i = indexes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
}

const leftLineIndexes = indexes.slice(0, charsPerLine);

const rightLineIndexes = indexes.slice(charsPerLine, charsPerLine * 2);

const randomIndexes = indexes.slice(charsPerLine * 2);

/* sort */

leftLineIndexes.sort((a, b) => positions[b].top - positions[a].top);

rightLineIndexes.sort((a, b) => positions[b].top - positions[a].top);

randomIndexes.sort((a, b) => positions[b].top - positions[a].top);

const charData = new Array(totalChars);

/* left */

leftLineIndexes.forEach((charIdx, lineIdx) => {
    charData[charIdx] = {
        group: "left",
        lineIndex: lineIdx,
    };
});

/* right */

rightLineIndexes.forEach((charIdx, lineIdx) => {
    charData[charIdx] = {
        group: "right",
        lineIndex: lineIdx,
    };
});

/* random */

const halfRandom = Math.floor(randomIndexes.length / 2);

randomIndexes.forEach((charIdx, idx) => {
    charData[charIdx] = {
        group: idx < halfRandom ? "leftBox" : "rightBox",

        randomIndex: idx < halfRandom ? idx : idx - halfRandom,
    };
});

/* -------------------------------------------------------
   TEXT TIMELINE
------------------------------------------------------- */

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

/* -------------------------------------------------------
   CHARACTER POSITIONS
------------------------------------------------------- */

split.chars.forEach((char, i) => {
    const data = charData[i];

    let startLeft;
    let startTop;
    let animationDelay;

    /* LEFT COLUMN */

    if (data.group === "left") {
        startLeft = line1X - (textRect.left - wrapperRect.left);

        startTop =
            boxTop + data.lineIndex * 15 - (textRect.top - wrapperRect.top);

        animationDelay = -data.lineIndex * 0.01;
    } else if (data.group === "right") {
        /* RIGHT COLUMN */
        startLeft = line2X - (textRect.left - wrapperRect.left);

        startTop =
            boxTop + data.lineIndex * 15 - (textRect.top - wrapperRect.top);

        animationDelay = -data.lineIndex * 0.01;
    } else if (data.group === "leftBox") {
        /* LEFT RANDOM BOX */
        startLeft =
            line1X +
            Math.random() * boxWidth -
            (textRect.left - wrapperRect.left);

        startTop =
            boxTop +
            Math.random() * boxHeight -
            (textRect.top - wrapperRect.top);

        animationDelay = -(charsPerLine * 0.01) + data.randomIndex * 0.01;
    } else {
        /* RIGHT RANDOM BOX */
        startLeft =
            line2X -
            boxWidth +
            Math.random() * boxWidth -
            (textRect.left - wrapperRect.left);

        startTop =
            boxTop +
            Math.random() * boxHeight -
            (textRect.top - wrapperRect.top);

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
        animationDelay,
    );
});

/* -------------------------------------------------------
   SECOND SECTION 
------------------------------------------------------- */

const next = document.querySelector(".next");

const nextNumber = document.querySelector(".next-number");

const nextTitle = document.querySelector(".next h2");

const nextParagraph = document.querySelector(".next-content > p");

const nextLine = document.querySelector(".next-line");

const nextFooter = document.querySelector(".next-footer");

/* -------------------------------------------------------
   SPLIT TITLE
------------------------------------------------------- */

const titleSplit = new SplitText(nextTitle, {
    type: "lines",
});

/* -------------------------------------------------------
   INITIAL STATE
------------------------------------------------------- */

gsap.set(titleSplit.lines, {
    yPercent: 120,
    opacity: 0,
    rotate: 3,
});

gsap.set(nextNumber, {
    y: 40,
    opacity: 0,
});

gsap.set(nextParagraph, {
    y: 60,
    opacity: 0,
});

gsap.set(nextFooter, {
    y: 30,
    opacity: 0,
});

gsap.set(nextLine, {
    scaleX: 0,
    transformOrigin: "left center",
});

/* -------------------------------------------------------
   LONG SCROLL TIMELINE
------------------------------------------------------- */

const nextTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: next,

        start: "top top",
        end: "+=220%",

        scrub: 1.5,

        pin: true,

        anticipatePin: 1,
    },
});

/* -------------------------------------------------------
   01 — SECTION NUMBER
------------------------------------------------------- */

nextTimeline.to(nextNumber, {
    y: 0,
    opacity: 1,

    duration: 1.2,

    ease: "power3.out",
});

/* -------------------------------------------------------
   02 — FIRST TITLE LINE
------------------------------------------------------- */

nextTimeline.to(
    titleSplit.lines[0],
    {
        yPercent: 0,
        opacity: 1,
        rotate: 0,

        duration: 2,

        ease: "power4.out",
    },
    "+=0.5",
);

/* -------------------------------------------------------
   03 — SECOND TITLE LINE
------------------------------------------------------- */

nextTimeline.to(
    titleSplit.lines[1],
    {
        yPercent: 0,
        opacity: 1,
        rotate: 0,

        duration: 2,

        ease: "power4.out",
    },
    "+=0.4",
);

/* -------------------------------------------------------
   04 — HORIZONTAL LINE
------------------------------------------------------- */

nextTimeline.to(
    nextLine,
    {
        scaleX: 1,

        duration: 1.8,

        ease: "power3.inOut",
    },
    "+=0.5",
);

/* -------------------------------------------------------
   05 — DESCRIPTION
------------------------------------------------------- */

nextTimeline.to(
    nextParagraph,
    {
        y: 0,
        opacity: 1,

        duration: 1.8,

        ease: "power3.out",
    },
    "+=0.3",
);

/* -------------------------------------------------------
   06 — FOOTER
------------------------------------------------------- */

nextTimeline.to(
    nextFooter,
    {
        y: 0,
        opacity: 1,

        duration: 1.2,

        ease: "power3.out",
    },
    "+=0.5",
);
