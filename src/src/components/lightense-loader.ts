import Lightense from "lightense-images";

export class LightenseLoader {
    public attachHandlers(): void {
        let images = document.querySelectorAll(".s-article img");
        for (let image of images) {
            image.setAttribute("data-background", "rgba(255, 255, 255, 0.6)")
        }
        Lightense(images);
    }
}