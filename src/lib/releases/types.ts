export interface ReleaseEntry {
  slug: string;
  title: string;
}

export interface ReleaseDocument extends ReleaseEntry {
  bodyMarkdown: string;
}
