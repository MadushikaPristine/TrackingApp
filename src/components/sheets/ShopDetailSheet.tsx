import React, {forwardRef, useImperativeHandle, useRef, useCallback, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking} from 'react-native';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {Shop} from '../../types';
import {COLORS} from '../../constants/colors';
import {CONFIG} from '../../constants/config';
import Badge from '../common/Badge';
import {formatCurrency, formatVisitTime} from '../../utils/mapUtils';

export interface ShopDetailSheetRef {
  open: (shop: Shop) => void;
  close: () => void;
}

const ShopDetailSheet = forwardRef<ShopDetailSheetRef>((_, ref) => {
  const sheetRef = useRef<BottomSheet>(null);
  const [shop, setShop] = useState<Shop | null>(null);

  useImperativeHandle(ref, () => ({
    open: (s: Shop) => {
      setShop(s);
      sheetRef.current?.snapToIndex(0);
    },
    close: () => {
      sheetRef.current?.close();
    },
  }));

  const handleClose = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const handleCallPhone = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {});
  }, []);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={CONFIG.BOTTOM_SHEET_SNAP_POINTS}
      enablePanDownToClose
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}>
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        {shop && (
          <>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <Text style={styles.address}>{shop.address}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Status row */}
            <View style={styles.statusRow}>
              <Badge status={shop.visitStatus} size="lg" />
              <View style={styles.seqBadge}>
                <Text style={styles.seqText}>Stop #{shop.sequence}</Text>
              </View>
            </View>

            {/* Info grid */}
            <View style={styles.infoGrid}>
              <InfoCell label="Visit Time" value={formatVisitTime(shop.visitTime)} />
              <InfoCell label="Order Amount" value={formatCurrency(shop.orderAmount)} />
            </View>

            {/* Contact */}
            {shop.contactName && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact</Text>
                <View style={styles.contactRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {shop.contactName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{shop.contactName}</Text>
                    {shop.contactPhone && (
                      <TouchableOpacity onPress={() => handleCallPhone(shop.contactPhone!)}>
                        <Text style={styles.contactPhone}>{shop.contactPhone}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Notes */}
            {shop.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{shop.notes}</Text>
                </View>
              </View>
            )}
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

ShopDetailSheet.displayName = 'ShopDetailSheet';
export default ShopDetailSheet;

function InfoCell({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoCellLabel}>{label}</Text>
      <Text style={styles.infoCellValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  handle: {backgroundColor: COLORS.border, width: 40},
  background: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {paddingHorizontal: 20, paddingBottom: 40},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingTop: 4,
  },
  headerLeft: {flex: 1, marginRight: 12},
  shopName: {fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4},
  address: {fontSize: 13, color: COLORS.textSecondary, lineHeight: 18},
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {fontSize: 12, color: COLORS.textSecondary, fontWeight: '600'},
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16},
  seqBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceAlt,
  },
  seqText: {fontSize: 12, fontWeight: '600', color: COLORS.textSecondary},
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoCell: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 14,
  },
  infoCellLabel: {fontSize: 11, color: COLORS.textLight, fontWeight: '500', marginBottom: 4},
  infoCellValue: {fontSize: 15, color: COLORS.textPrimary, fontWeight: '700'},
  section: {marginBottom: 18},
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  contactRow: {flexDirection: 'row', alignItems: 'center'},
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {fontSize: 14, fontWeight: '700', color: COLORS.textInverse},
  contactInfo: {flex: 1},
  contactName: {fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2},
  contactPhone: {fontSize: 13, color: COLORS.info},
  notesBox: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  notesText: {fontSize: 14, color: COLORS.textSecondary, lineHeight: 20},
});
