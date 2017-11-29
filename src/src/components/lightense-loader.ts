import Lightense from "lightense-images";

export class LightenseLoader {
    public attachHandlers(): void {

        let oldBackdrops = document.querySelectorAll(".lightense-backdrop");
        for (let element of oldBackdrops) {
            element.remove();
        }
        let oldStyleTags = document.querySelectorAll("style");
        for (let element of oldStyleTags) {
            if (/.*\.lightense-backdrop.*/g.test(element.innerText)) {
                element.remove();
            }
        }

        let images = document.querySelectorAll(".s-article img");
        for (let image of images) {
            image.setAttribute("data-background", "rgba(255, 255, 255, 0.6)")
        }
        Lightense(images);
    }
}