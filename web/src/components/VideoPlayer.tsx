import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { SponsorBlockService } from '../services/sponsorblock.service';
import {
  IoExpand,
  IoContract,
  IoTvOutline,
  IoSpeedometerOutline,
  IoFlash,
  IoShieldCheckmark,
  IoSwapHorizontal,
} from 'react-icons/io5';

export type PlayerServer = 'piped-1' | 'piped-2' | 'direct';

interface ServerOption {
  id: PlayerServer;
  label: string;
  badge: string;
  isAdFree: boolean;
  getUrl: (id: string, autoplay: boolean) => string;
}

const PLAYER_SERVERS: ServerOption[] = [
  {
    id: 'piped-1',
    label: 'Ad-Free 1',
    badge: '100% Zero Ads',
    isAdFree: true,
    getUrl: (id) => `https://piped.video/embed/${id}?autoplay=1`,
  },
  {
    id: 'piped-2',
    label: 'Ad-Free 2',
    badge: 'Fast Backup',
    isAdFree: true,
    getUrl: (id) => `https://piped.mha.fi/embed/${id}?autoplay=1`,
  },
  {
    id: 'direct',
    label: 'Direct',
    badge: 'Official',
    isAdFree: false,
    getUrl: (id, autoplay) =>
      `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&playsinline=1&rel=0&iv_load_policy=3&modestbranding=1`,
  },
];

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

  const [selectedServer, setSelectedServer] = useState<PlayerServer>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('@saddutube_player_server') as PlayerServer;
      if (saved && (saved === 'piped-1' || saved === 'piped-2' || saved === 'direct')) {
        return saved;
      }
    }
    return 'piped-1';
  });

  const handleSelectServer = (serverId: PlayerServer) => {
    setSelectedServer(serverId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('@saddutube_player_server', serverId);
    }
  };

  const currentServerOption =
    PLAYER_SERVERS.find((s) => s.id === selectedServer) || PLAYER_SERVERS[0];

  // SponsorBlock query and auto-skip monitor
  useEffect(() => {
    let isCancelled = false;

    const checkSponsorBlock = async () => {
      const segments = await SponsorBlockService.getSegmentsForVideo(videoId);
      if (isCancelled || !segments || segments.length === 0) return;

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
      {/* Top Stream Server Selector Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.45rem 0.85rem',
          backgroundColor: '#0A0A0F',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.78rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.74rem' }}>
            SERVER:
          </span>
          {PLAYER_SERVERS.map((server) => {
            const isActive = selectedServer === server.id;
            return (
              <button
                key={server.id}
                onClick={() => handleSelectServer(server.id)}
                style={{
                  padding: '0.22rem 0.6rem',
                  borderRadius: 8,
                  border: isActive
                    ? `1px solid ${server.isAdFree ? '#10B981' : colors.primary}`
                    : '1px solid rgba(255,255,255,0.12)',
                  backgroundColor: isActive
                    ? server.isAdFree
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(255, 30, 56, 0.2)'
                    : 'rgba(255,255,255,0.04)',
                  color: isActive
                    ? server.isAdFree
                      ? '#34D399'
                      : '#FFF'
                    : '#94A3B8',
                  fontSize: '0.74rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.18s ease',
                }}
              >
                {server.isAdFree ? (
                  <IoShieldCheckmark size={12} color="#10B981" />
                ) : (
                  <span>⚡</span>
                )}
                {server.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {currentServerOption.isAdFree ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: '#10B981',
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                padding: '0.15rem 0.5rem',
                borderRadius: 6,
              }}
            >
              <IoShieldCheckmark size={12} />
              100% Ad-Free Active
            </span>
          ) : (
            <span
              style={{
                color: '#F59E0B',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                padding: '0.15rem 0.5rem',
                borderRadius: 6,
              }}
            >
              Direct YouTube Player
            </span>
          )}
        </div>
      </div>

      {/* Main Responsive Video Player Viewport */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
        <iframe
          key={`${videoId}-${selectedServer}`}
          src={currentServerOption.getUrl(videoId, true)}
          title={title || 'SadduTube Player'}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* Player Pro Controls & Status Bar */}
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
          flexWrap: 'wrap',
          gap: '0.5rem',
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
              SponsorBlock ({skippedCount} segments skipped)
            </span>
          )}

          {/* Quick Server Switch Helper */}
          <button
            onClick={() => {
              const nextServer =
                selectedServer === 'piped-1'
                  ? 'piped-2'
                  : selectedServer === 'piped-2'
                  ? 'direct'
                  : 'piped-1';
              handleSelectServer(nextServer);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#38BDF8',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: 0,
            }}
          >
            <IoSwapHorizontal size={13} />
            Switch Server
          </button>
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

