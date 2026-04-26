// constants/responsive.js
import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const wScale = SCREEN_W / BASE_WIDTH;
const moderateScale = (size, factor = 0.5) =>
  size + (size * wScale - size) * factor;

export const rs = (size) => Math.round(moderateScale(size, 0.5));
export const rf = (size) => Math.round(moderateScale(size, 0.4));
export const rp = rs;

export const SCREEN_WIDTH = SCREEN_W;
export const SCREEN_HEIGHT = SCREEN_H;

export const isSmallDevice = SCREEN_W < 360;
export const isMediumDevice = SCREEN_W >= 360 && SCREEN_W < 400;
export const isLargeDevice = SCREEN_W >= 400;
