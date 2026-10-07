import stickerRocket from "@/assets/sticker-rocket.png";
import stickerMug from "@/assets/sticker-mug.png";
import stickerStar from "@/assets/sticker-star.png";
import stickerHeart from "@/assets/sticker-heart.png";
import stickerBulb from "@/assets/sticker-bulb.png";

export const STICKER_IMAGES: Record<string, string> = {
  rocket: stickerRocket,
  mug: stickerMug,
  star: stickerStar,
  heart: stickerHeart,
  bulb: stickerBulb,
};

/** Weekly-hours milestones; hitting one unlocks its sticker. */
export const MILESTONES = [
  { hours: 2, sticker: "mug", name: "Warm-up mug" },
  { hours: 4, sticker: "bulb", name: "Bright idea" },
  { hours: 6, sticker: "star", name: "Steady star" },
  { hours: 8, sticker: "rocket", name: "Lift-off" },
  { hours: 10, sticker: "heart", name: "Full heart" },
];
