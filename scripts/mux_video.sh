#!/usr/bin/env bash
set -e

# Sentinel402 Gateway - Demo Video Muxer
# Combines screen recording with neural voiceover and subtitles into a submission-ready MP4.

export PATH="$HOME/.local/share/mise/shims:$PATH"

if ! command -v ffmpeg &> /dev/null; then
  echo "[Error] ffmpeg not found in PATH or ~/.local/share/mise/shims"
  exit 1
fi

VIDEO_INPUT="${1:-recordings/sentinel402_screen_demo.webm}"
AUDIO_INPUT="${2:-recordings/demo_voiceover.mp3}"
OUTPUT_FILE="${3:-recordings/sentinel402_demo_submission.mp4}"

if [ ! -f "$VIDEO_INPUT" ]; then
  echo "[Error] Video file not found: $VIDEO_INPUT"
  echo "Usage: $0 [screen_recording.webm|mp4] [voiceover.mp3] [output.mp4]"
  exit 1
fi

if [ ! -f "$VIDEO_INPUT" ]; then
  echo "[Error] Video file not found: $VIDEO_INPUT"
  exit 1
fi

if [ ! -f "$AUDIO_INPUT" ]; then
  echo "[Error] Audio file not found: $AUDIO_INPUT"
  echo "Tip: Run 'npm run voiceover' first to generate recordings/demo_voiceover.mp3"
  exit 1
fi

echo "=========================================="
echo " Sentinel402 Demo Video Muxer (FFmpeg)"
echo "=========================================="
echo " Video Input : $VIDEO_INPUT"
echo " Audio Input : $AUDIO_INPUT"
echo " Output File : $OUTPUT_FILE"
echo "------------------------------------------"

# Ensure output directory exists
mkdir -p "$(dirname "$OUTPUT_FILE")"

# Execute FFmpeg muxing:
# - Re-encode video to H.264 (YUV420p, CRF 18 for pristine visual fidelity)
# - Audio encoded with MP3 (libmp3lame at 192kbps) for universal playback including VSCode
# - EBU R128 loudness normalization for broadcast-quality speech levels
# - Faststart flag enabled for smooth web streaming
# - Burn in subtitles using Inter modern font (Fontsize 42, 1.5x scale, centered with margins and light border)
VF_ARGS=()
if [ -f "recordings/demo_voiceover.vtt" ]; then
  FONTS_DIR="$(pwd)/recordings/fonts"
  VF_ARGS=(-vf "subtitles=recordings/demo_voiceover.vtt:fontsdir=${FONTS_DIR}:force_style='PlayResX=1440,PlayResY=810,Fontname=Inter,Fontsize=42,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1.8,Shadow=1.2,BackColour=&H60000000,MarginV=14,MarginL=70,MarginR=70,Alignment=2,WrapStyle=0'")
  echo " Subtitles   : recordings/demo_voiceover.vtt (Burned in with Inter font, Fontsize=42, clean acronyms & light border)"
fi

ffmpeg -y \
  -i "$VIDEO_INPUT" \
  -i "$AUDIO_INPUT" \
  -map 0:v:0 \
  -map 1:a:0 \
  "${VF_ARGS[@]}" \
  -c:v libx264 \
  -preset medium \
  -crf 18 \
  -pix_fmt yuv420p \
  -c:a libmp3lame \
  -b:a 192k \
  -filter:a "loudnorm=I=-16:TP=-1.5:LRA=11" \
  -movflags +faststart \
  "$OUTPUT_FILE"

echo "------------------------------------------"
echo "✅ Video muxing complete: $OUTPUT_FILE"
if command -v ffprobe &> /dev/null; then
  ffprobe -v error -show_entries format=duration,size,bit_rate -of default=noprint_wrappers=1 "$OUTPUT_FILE"
fi
echo "=========================================="
