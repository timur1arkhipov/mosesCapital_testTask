export type PixabayImage = {
  webformatURL: string
  tags: string
}
  
export type FeedItem = {
  regular: FeedImage | { state: string }
  graffiti: FeedImage | { state: string }
}
  
export type FeedImage = {
  image: string
  tags: string
}
