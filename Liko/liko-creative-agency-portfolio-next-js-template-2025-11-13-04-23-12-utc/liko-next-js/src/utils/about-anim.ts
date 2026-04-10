import gsap from "gsap";
import { ScrollTrigger } from "@/plugins";

function aboutAnim() {
    let ab = gsap.matchMedia();
    ab.add("(min-width: 768px)", () => {
            gsap.set(".tp-about-2-thumb-main", { rotation: 0, });
            gsap.to(".tp-about-2-thumb-main", {
                scrollTrigger: {
                    trigger: ('.tp-about-2-area'),
                    start: "top top",
                    markers: false
                },
                duration: 1,
                rotation: -10,
            });

            gsap.set(".tp-about-2-thumb-inner", { rotation: 0, });
            gsap.to(".tp-about-2-thumb-inner", {
                scrollTrigger: {
                    trigger: ('.tp-about-2-area'),
                    start: "top top",
                    markers: false
                },
                duration: 1,
                rotation: 12,
            });
        }

    )
};

export { aboutAnim };