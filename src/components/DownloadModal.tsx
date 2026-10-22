import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { DownloadService, StreamOption } from '../services/download.service';

interface DownloadModalProps {
  visible: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    channelTitle?: string;
    thumbnailUrl?: string;
  } | null;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ visible, onClose, video }) => {
  const { theme } = useTheme();

  const [loadingStreams, setLoadingStreams] = useState<boolean>(true);
  const [streamOptions, setStreamOptions] = useState<StreamOption[]>([]);
  const [selectedStream, setSelectedStream] = useState<StreamOption | null>(null);

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadComplete, setDownloadComplete] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && video) {
      setLoadingStreams(true);
      setDownloadComplete(false);
      setDownloadError(null);
      setDownloadProgress(0);
      setIsDownloading(false);

      DownloadService.resolveStreams(video.id)
        .then((options) => {
          setStreamOptions(options);
          if (options.length > 0) {
            setSelectedStream(options[0]);
          }
        })
        .catch(() => {
          setDownloadError('Could not load download streams.');
        })
        .finally(() => {
          setLoadingStreams(false);
        });
    }
  }, [visible, video]);

  const handleStartDownload = async () => {
    if (!video || !selectedStream) return;

    setIsDownloading(true);
    setDownloadProgress(0.05);

    try {
      await DownloadService.startDownload(video, selectedStream, (progress) => {
        setDownloadProgress(progress);
      });
      setDownloadComplete(true);
    } catch (e: any) {
      setDownloadError(e.message || 'Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!video) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              {/* Modal Header */}
              <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <View style={styles.headerLeft}>
                  <Ionicons name="cloud-download-outline" size={22} color={theme.colors.primary} />
                  <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Offline Download</Text>
                </View>
                {!isDownloading && (
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Video Title Preview */}
              <View style={styles.videoMetaPreview}>
                <Text numberOfLines={2} style={[styles.videoTitle, { color: theme.colors.textPrimary }]}>
                  {video.title}
                </Text>
                {video.channelTitle && (
                  <Text numberOfLines={1} style={[styles.channelTitle, { color: theme.colors.textMuted }]}>
                    {video.channelTitle}
                  </Text>
                )}
              </View>

              {/* Stream Options / Progress Body */}
              <View style={styles.body}>
                {loadingStreams ? (
                  <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
                      Fetching available formats...
                    </Text>
                  </View>
                ) : downloadComplete ? (
                  <View style={styles.centerContainer}>
                    <Ionicons name="checkmark-circle" size={54} color="#34C759" />
                    <Text style={[styles.successTitle, { color: theme.colors.textPrimary }]}>Download Complete!</Text>
                    <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
                      Saved to offline library. You can play this video anytime without internet.
                    </Text>
                    <View style={styles.completeActions}>
                      <TouchableOpacity
                        style={[styles.viewDownloadsBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={() => {
                          onClose();
                          router.push('/downloads' as any);
                        }}
                      >
                        <Ionicons name="folder-open-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.viewDownloadsBtnText}>View in Downloads</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.doneBtn, { borderColor: theme.colors.border }]} onPress={onClose}>
                        <Text style={[styles.doneBtnText, { color: theme.colors.textPrimary }]}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : isDownloading ? (
                  <View style={styles.centerContainer}>
                    <Text style={[styles.downloadingTitle, { color: theme.colors.textPrimary }]}>
                      Downloading {selectedStream?.label}...
                    </Text>
                    <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${Math.round(downloadProgress * 100)}%`, backgroundColor: theme.colors.primary },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressPercent, { color: theme.colors.primary }]}>
                      {Math.round(downloadProgress * 100)}%
                    </Text>
                    <Text style={[styles.statusText, { color: theme.colors.textMuted }]}>
                      Please keep the app open while saving offline
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={[styles.sectionHeading, { color: theme.colors.textSecondary }]}>
                      Select Format & Quality:
                    </Text>

                    <View style={styles.streamList}>
                      {streamOptions.map((stream, idx) => {
                        const isSelected = selectedStream === stream;
                        return (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.streamItem,
                              { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border },
                              isSelected && {
                                borderColor: theme.colors.primary,
                                backgroundColor: 'rgba(255, 30, 56, 0.08)',
                              },
                            ]}
                            onPress={() => setSelectedStream(stream)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.streamLeft}>
                              <Ionicons
                                name={stream.format === 'video' ? 'videocam' : 'musical-notes'}
                                size={20}
                                color={isSelected ? theme.colors.primary : theme.colors.textPrimary}
                              />
                              <View>
                                <Text
                                  style={[
                                    styles.streamLabel,
                                    { color: isSelected ? theme.colors.primary : theme.colors.textPrimary },
                                    isSelected && { fontWeight: '700' },
                                  ]}
                                >
                                  {stream.label}
                                </Text>
                                <Text style={[styles.streamSub, { color: theme.colors.textMuted }]}>
                                  {stream.format === 'video' ? 'MP4 Video Stream' : 'High Quality Audio'}
                                </Text>
                              </View>
                            </View>
                            <Ionicons
                              name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                              size={20}
                              color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {downloadError && (
                      <Text style={styles.errorBanner}>{downloadError}</Text>
                    )}

                    <TouchableOpacity
                      style={[styles.downloadBtn, { backgroundColor: theme.colors.primary }]}
                      onPress={handleStartDownload}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="download" size={18} color="#FFFFFF" />
                      <Text style={styles.downloadBtnText}>Start Download</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  videoMetaPreview: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
    marginBottom: 4,
  },
  channelTitle: {
    fontSize: 12,
  },
  body: {
    padding: 20,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  statusText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  streamList: {
    gap: 8,
    marginBottom: 16,
  },
  streamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  streamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streamLabel: {
    fontSize: 14,
  },
  streamSub: {
    fontSize: 11,
    marginTop: 1,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  downloadingTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  completeActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  viewDownloadsBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  viewDownloadsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorBanner: {
    color: '#FF3B30',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
});
