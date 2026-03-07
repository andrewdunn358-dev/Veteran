/**
 * AgeGateModal - Date of Birth Collection Modal
 * 
 * Collects user's date of birth for age verification.
 * DOB is stored ONLY on the user's device for privacy.
 * 
 * Under-18 users have restricted access to:
 * - Peer matching / buddy finder
 * - Direct peer calls
 * 
 * But still have full access to:
 * - AI chat support (with enhanced safeguarding)
 * - Crisis support resources
 * - Staff-supervised chat
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Pressable,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AgeGateModalProps {
  visible: boolean;
  onSubmit: (dob: Date) => void;
  onSkip?: () => void;
}

// Custom picker modal for iOS-friendly selection
const PickerModal: React.FC<{
  visible: boolean;
  title: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}> = ({ visible, title, options, selectedValue, onSelect, onClose }) => {
  const flatListRef = useRef<FlatList>(null);
  
  // Scroll to selected item when modal opens
  React.useEffect(() => {
    if (visible && selectedValue && flatListRef.current) {
      const index = options.findIndex(o => o.value === selectedValue);
      if (index > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.3 });
        }, 100);
      }
    }
  }, [visible, selectedValue, options]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={pickerStyles.overlay} onPress={onClose}>
        <Pressable style={pickerStyles.container} onPress={(e) => e.stopPropagation()}>
          <View style={pickerStyles.header}>
            <Text style={pickerStyles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={pickerStyles.closeButton}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <FlatList
            ref={flatListRef}
            data={options}
            keyExtractor={(item) => item.value}
            style={pickerStyles.list}
            onScrollToIndexFailed={() => {}}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  pickerStyles.option,
                  selectedValue === item.value && pickerStyles.optionSelected,
                ]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    pickerStyles.optionText,
                    selectedValue === item.value && pickerStyles.optionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {selectedValue === item.value && (
                  <Ionicons name="checkmark" size={22} color="#3b82f6" />
                )}
              </TouchableOpacity>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: Dimensions.get('window').height * 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  list: {
    maxHeight: 350,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionSelected: {
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 16,
    color: '#334155',
  },
  optionTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

// Date picker component - works on both web and mobile
const DatePicker: React.FC<{
  day: string;
  month: string;
  year: string;
  onDayChange: (val: string) => void;
  onMonthChange: (val: string) => void;
  onYearChange: (val: string) => void;
}> = ({ day, month, year, onDayChange, onMonthChange, onYearChange }) => {
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Generate day options (1-31)
  const days = Array.from({ length: 31 }, (_, i) => {
    const num = i + 1;
    return { value: num.toString().padStart(2, '0'), label: num.toString() };
  });

  // Generate year options (current year - 100 to current year - 10)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 90 }, (_, i) => {
    const yearVal = currentYear - 10 - i;
    return { value: yearVal.toString(), label: yearVal.toString() };
  });

  const getMonthLabel = (val: string) => months.find(m => m.value === val)?.label || '--';

  // Use TouchableOpacity-based picker for better iOS compatibility
  return (
    <View style={styles.datePickerContainer}>
      {/* Day Picker */}
      <View style={styles.datePickerField}>
        <Text style={styles.datePickerLabel}>Day</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowDayPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pickerButtonText, !day && styles.pickerPlaceholder]}>
            {day || '--'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Month Picker */}
      <View style={[styles.datePickerField, { flex: 1.5 }]}>
        <Text style={styles.datePickerLabel}>Month</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowMonthPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pickerButtonText, !month && styles.pickerPlaceholder]} numberOfLines={1}>
            {getMonthLabel(month)}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Year Picker */}
      <View style={styles.datePickerField}>
        <Text style={styles.datePickerLabel}>Year</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowYearPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pickerButtonText, !year && styles.pickerPlaceholder]}>
            {year || '--'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Picker Modals */}
      <PickerModal
        visible={showDayPicker}
        title="Select Day"
        options={days}
        selectedValue={day}
        onSelect={onDayChange}
        onClose={() => setShowDayPicker(false)}
      />
      <PickerModal
        visible={showMonthPicker}
        title="Select Month"
        options={months}
        selectedValue={month}
        onSelect={onMonthChange}
        onClose={() => setShowMonthPicker(false)}
      />
      <PickerModal
        visible={showYearPicker}
        title="Select Year"
        options={years}
        selectedValue={year}
        onSelect={onYearChange}
        onClose={() => setShowYearPicker(false)}
      />
    </View>
  );
};

export default function AgeGateModal({ visible, onSubmit, onSkip }: AgeGateModalProps) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [showUnder18Info, setShowUnder18Info] = useState(false);

  const handleSubmit = () => {
    setError('');

    // Validate all fields are filled
    if (!day || !month || !year) {
      setError('Please enter your complete date of birth');
      return;
    }

    // Create date object
    const dob = new Date(`${year}-${month}-${day}T00:00:00`);
    
    // Validate date is real
    if (isNaN(dob.getTime())) {
      setError('Please enter a valid date');
      return;
    }

    // Validate age is reasonable (at least 10, not more than 100)
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 10) {
      setError('You must be at least 10 years old to use this app');
      return;
    }

    if (age > 100) {
      setError('Please enter a valid date of birth');
      return;
    }

    // Show info for under-18 users before submitting
    if (age < 18 && !showUnder18Info) {
      setShowUnder18Info(true);
      return;
    }

    onSubmit(dob);
  };

  const handleContinueUnder18 = () => {
    const dob = new Date(`${year}-${month}-${day}T00:00:00`);
    onSubmit(dob);
  };

  // Under-18 info screen
  if (showUnder18Info) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.under18IconContainer}>
              <Ionicons name="shield-checkmark" size={48} color="#3b82f6" />
            </View>
            <Text style={styles.under18Title}>Extra Protection Enabled</Text>
            <Text style={styles.under18Subtitle}>
              Because you're under 18, we've added extra safeguards to keep you safe.
            </Text>
            
            <ScrollView style={styles.under18List}>
              <View style={styles.under18Item}>
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                <View style={styles.under18ItemText}>
                  <Text style={styles.under18ItemTitle}>AI Support Available</Text>
                  <Text style={styles.under18ItemDesc}>Chat with our AI team 24/7 for support</Text>
                </View>
              </View>
              
              <View style={styles.under18Item}>
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                <View style={styles.under18ItemText}>
                  <Text style={styles.under18ItemTitle}>Crisis Support</Text>
                  <Text style={styles.under18ItemDesc}>Full access to crisis resources and helplines</Text>
                </View>
              </View>
              
              <View style={styles.under18Item}>
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                <View style={styles.under18ItemText}>
                  <Text style={styles.under18ItemTitle}>Staff Chat</Text>
                  <Text style={styles.under18ItemDesc}>Talk to trained staff when you need to</Text>
                </View>
              </View>
              
              <View style={[styles.under18Item, styles.restrictedItem]}>
                <Ionicons name="lock-closed" size={24} color="#94a3b8" />
                <View style={styles.under18ItemText}>
                  <Text style={styles.under18ItemTitleDisabled}>Peer Matching</Text>
                  <Text style={styles.under18ItemDesc}>Available when you turn 18</Text>
                </View>
              </View>
              
              <View style={[styles.under18Item, styles.restrictedItem]}>
                <Ionicons name="lock-closed" size={24} color="#94a3b8" />
                <View style={styles.under18ItemText}>
                  <Text style={styles.under18ItemTitleDisabled}>Direct Peer Calls</Text>
                  <Text style={styles.under18ItemDesc}>Available when you turn 18</Text>
                </View>
              </View>
            </ScrollView>

            <Pressable
              style={({ pressed }) => [
                styles.continueButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleContinueUnder18}
            >
              <Text style={styles.continueButtonText}>I Understand, Continue</Text>
            </Pressable>
            
            <Pressable
              style={styles.backButton}
              onPress={() => setShowUnder18Info(false)}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ScrollView 
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={true}
          bounces={false}
        >
          <View style={styles.modal}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={40} color="#3b82f6" />
            </View>
            
            <Text style={styles.title}>Date of Birth</Text>
            <Text style={styles.description}>
              We need your date of birth to provide age-appropriate support.
            </Text>

            <DatePicker
              day={day}
              month={month}
              year={year}
              onDayChange={setDay}
              onMonthChange={setMonth}
              onYearChange={setYear}
            />

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.privacyNote}>
              <Ionicons name="shield-checkmark" size={16} color="#22c55e" />
              <Text style={styles.privacyText}>
                Stored locally on your device only
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Continue</Text>
            </Pressable>

            {onSkip && (
              <Pressable style={styles.skipButton} onPress={onSkip}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalScrollView: {
    maxHeight: '85%',
    width: '100%',
    maxWidth: 400,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  datePickerContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  datePickerField: {
    flex: 1,
  },
  datePickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  pickerPlaceholder: {
    color: '#94a3b8',
  },
  mobileNotice: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  privacyText: {
    color: '#166534',
    fontSize: 12,
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  skipButtonText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  // Under 18 info screen styles
  under18IconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  under18Title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  under18Subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  under18List: {
    width: '100%',
    maxHeight: 280,
    marginBottom: 20,
  },
  under18Item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    marginBottom: 10,
  },
  restrictedItem: {
    backgroundColor: '#f8fafc',
  },
  under18ItemText: {
    flex: 1,
  },
  under18ItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 2,
  },
  under18ItemTitleDisabled: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 2,
  },
  under18ItemDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  continueButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
});
