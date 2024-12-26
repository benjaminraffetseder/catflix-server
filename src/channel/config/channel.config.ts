export const YOUTUBE_CHANNELS = [
  'fourpawstv',
  'PaulDinningVideosforCats',
  'BirderKing',
  'BirdsandSquirrelsWonderl',
  'PaulBirder',
  'catgamegarden',
  'catgametv',
  'BirderChieu',
  'CatFlixVideosforCats',
  'RedSquirrelStudios',
  'BirdsForCatsTV-x5p',
] as const;

export type YoutubeChannel = (typeof YOUTUBE_CHANNELS)[number];

export const isValidYoutubeChannel = (
  channel: string,
): channel is YoutubeChannel => {
  return YOUTUBE_CHANNELS.includes(channel as YoutubeChannel);
};
