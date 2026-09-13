#!/usr/bin/env bash
set -e

# Sentinel402 Gateway - Demo Video Muxer
# Combines screen recording with neural voiceover and subtitles into a submission-ready MP4.

export PATH="$HOME/.local/share/mise/shims:$PATH"

if ! command -v ffmpeg &> /dev/null; then
  echo "[Error] ffmpeg not found in PATH or ~/.local/share/mise/shims"
  exit 1
fi

VIDEO_INPUT="${1}"
AUDIO_INPUT="${2:-recordings/demo_voiceover.mp3}"
OUTPUT_FILE="${3:-recordings/sentinel402_demo_submission.mp4}"

if [ -z "$VIDEO_INPUT" ]; then
  echo "Usage: $0 <screen_recording.webm|mp4> [voiceover.mp3] [output.mp4]"
  echo ""
  echo "Example:"
  echo "  $0 recordings/my_screen_capture.webm"
  echo "  $0 screen.mp4 recordings/demo_voiceover.mp3 recordings/final_demo.mp4"
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
# - Audio encoded with AAC at 192kbps
# - EBU R128 loudness normalization for broadcast-quality speech levels
# - Faststart flag enabled for smooth web streaming
# Check for matching subtitle file
SUB_ARGS=()
if [ -f "recordings/demo_voiceover.vtt" ]; then
  SUB_ARGS=(-i "recordings/demo_voiceover.vtt" -c:s mov_text -metadata:s:s:0 language=eng)
  echo " Subtitles   : recordings/demo_voiceover.vtt (Embedded as soft captions)"
fi

ffmpeg -y \
  -i "$VIDEO_INPUT" \
  -i "$AUDIO_INPUT" \
  "${SUB_ARGS[@]}" \
  -map 0:v:0 \
  -map 1:a:0 \
  $([ ${#SUB_ARGS[@]} -gt 0 ] && echo "-map 2:s:0") \
  -c:v libx264 \
  -preset medium \
  -crf 18 \
  -pix_fmt yuv420p \
  -c:a aac \
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
