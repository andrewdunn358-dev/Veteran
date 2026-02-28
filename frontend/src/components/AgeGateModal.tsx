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

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AgeGateModalProps {
  visible: boolean;
  onSubmit: (dob: Date) => void;
  onSkip?: () => void;
}

// Date picker component for web
const DatePicker: React.FC<{
  day: string;
  month: string;
  year: string;
  onDayChange: (val: string) => void;
  onMonthChange: (val: string) => void;
  onYearChange: (val: string) => void;
}> = ({ day, month, year, onDayChange, onMonthChange, onYearChange }) => {
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

  if (Platform.OS === 'web') {
    // Web: Use HTML select elements for better UX
    return (
      <View style={styles.datePickerContainer}>
        <View style={styles.datePickerField}>
          <Text style={styles.datePickerLabel}>Day</Text>
          <select
            value={day}
            onChange={(e) => onDayChange(e.target.value)}
            style={selectStyle}
          >
            <option value="">--</option>
            {days.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </View>
        <View style={styles.datePickerField}>
          <Text style={styles.datePickerLabel}>Month</Text>
          <select
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            style={selectStyle}
          >
            <option value="">--</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </View>
        <View style={styles.datePickerField}>
          <Text style={styles.datePickerLabel}>Year</Text>
          <select
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            style={selectStyle}
          >
            <option value="">--</option>
            {years.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>
        </View>
      </View>
    );
  }

  // Mobile: Use picker or simple inputs (simplified for this implementation)
  return (
    <View style={styles.datePickerContainer}>
      <Text style={styles.mobileNotice}>
        Please enter your date of birth
      </Text>
      {/* For mobile, you would use a native date picker here */}
    </View>
  );
};

// Style for web select elements
const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  fontSize: '16px',
  borderRadius: '10px',
  border: '2px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  color: '#1e293b',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
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
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar" size={48} color="#3b82f6" />
          </View>
          
          <Text style={styles.title}>Date of Birth</Text>
          <Text style={styles.description}>
            We ask for your date of birth to provide age-appropriate support and safeguarding. 
            Your information stays on your device only.
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
              Your date of birth is stored locally on your device and never shared
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
    padding: 20,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    maxHeight: '90%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
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
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 20,
    width: '100%',
  },
  privacyText: {
    color: '#166534',
    fontSize: 13,
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
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
