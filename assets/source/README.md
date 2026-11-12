# Your own art

The profile works without anything here: a drawn placeholder character stands in.
Drop files in this folder and run `node scripts/build-animated.mjs` (or push to
main and the Action rebuilds) to swap yourself in.

| File | Used in | Notes |
| --- | --- | --- |
| `clip/001.jpg`, `clip/002.jpg`, ... | Hero viewfinder | Frames of a 2-second clip of you waving against a plain dark wall. Every frame is embedded, so keep it to about 12–20 small JPGs (around 400 px wide). |
| `still.png` | Hero viewfinder | A single photo, used when there is no `clip/` folder. |
| `portrait.png` | ID badge | Image prompt A from the guide: upper body, front facing, transparent background. |
| `pointing.png` | Connect footer | Image prompt B: full body, winking, pointing to the side, transparent background. |

To cut a phone video into frames (needs ffmpeg):

```sh
ffmpeg -i wave.mp4 -t 2 -vf "fps=8,scale=400:-1" -q:v 6 assets/source/clip/%03d.jpg
```
