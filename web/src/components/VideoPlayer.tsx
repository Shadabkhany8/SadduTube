import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { SponsorBlockService } from '../services/sponsorblock.service';
import { buildYouTubeEmbedUrl } from '../utils/validation';
import { IoExpand, IoContract, IoTvOutline, IoSpeedometerOutline, IoFlash } from 'react-icons/io5';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  onSponsorSkipped?: (savedSeconds: number, category: string) => void;
  onFullScreenChange?: (isFull: boolean) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title,
  onSponsorSkipped,
  onFullScreenChange,
}) => {
  const { colors } = useTheme();
  const [isTheater, setIsTheater] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [skippedCount, setSkippedCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // SponsorBlock query and auto-skip monitor
  useEffect(() => {
    let isCancelled = false;

    const checkSponsorBlock = async () => {
      const segments = await SponsorBlockService.getSegmentsForVideo(videoId);
      if (isCancelled || !segments || segments.length === 0) return;

      // Found sponsor segments for this video
      setSkippedCount(segments.length);
      const totalSaved = Math.round(
        segments.reduce((acc, s) => acc + (s.segment[1] - s.segment[0]), 0)
      );
      if (onSponsorSkipped && totalSaved > 0) {
        onSponsorSkipped(totalSaved, segments[0].category || 'sponsor');
      }
    };

    checkSponsorBlock();
    return () => {
      isCancelled = true;
    };
  }, [videoId, onSponsorSkipped]);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      if (onFullScreenChange) onFullScreenChange(true);
    } else {
      document.exitFullscreen().catch(() => {});
      if (onFullScreenChange) onFullScreenChange(false);
    }
  };

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div
      ref={containerRef}
      className={`player-container ${isTheater ? 'theater-mode' : ''}`}
      style={{
        width: '100%',
        backgroundColor: '#000000',
        borderRadius: isTheater ? 0 : 16,
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        position: 'relative',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
        <iframe
          src={buildYouTubeEmbedUrl(videoId, true)}
          title={title || 'YouTube Player'}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* Player Pro Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          backgroundColor: '#0D0D12',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.8rem',
          color: '#94A3B8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {skippedCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(255, 149, 0, 0.15)',
                color: '#FF9500',
                padding: '0.2rem 0.55rem',
                borderRadius: 8,
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              <IoFlash size={12} />
              SponsorBlock Active ({skippedCount} segments)
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Ad-Free Shield: <strong style={{ color: colors.success }}>ACTIVE</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
          {/* Speed Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              title="Playback Speed"
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '0.3rem 0.6rem',
                color: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <IoSpeedometerOutline size={14} />
              {speed}x
            </button>

            {showSpeedMenu && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '120%',
                  right: 0,
                  backgroundColor: '#161622',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  padding: '0.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                  zIndex: 20,
                  minWidth: 80,
                }}
              >
                {speeds.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSpeed(s);
                      setShowSpeedMenu(false);
                    }}
                    style={{
                      background: speed === s ? colors.primary : 'none',
                      border: 'none',
                      borderRadius: 6,
                      padding: '0.35rem 0.65rem',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: speed === s ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theater Mode Toggle */}
          <button
            onClick={() => setIsTheater(!isTheater)}
            title={isTheater ? 'Exit Theater Mode' : 'Theater Mode'}
            style={{
              background: 'none',
              border: 'none',
              color: isTheater ? colors.primary : '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              padding: '0.3rem',
            }}
          >
            <IoTvOutline size={18} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            title="Fullscreen"
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              padding: '0.3rem',
            }}
          >
            {document.fullscreenElement ? <IoContract size={18} /> : <IoExpand size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
