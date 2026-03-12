import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Button, Switch } from 'react-native-paper';

const WEEK_DAYS = [
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' },
];

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

type Availability = { [day: string]: { enabled: boolean; slots: string[] } };

const DEFAULT_AVAIL: Availability = {
  seg: { enabled: true, slots: ['08:00', '10:00', '14:00', '16:00'] },
  ter: { enabled: true, slots: ['09:00', '11:00', '15:00'] },
  qua: { enabled: true, slots: ['08:00', '10:00', '14:00'] },
  qui: { enabled: false, slots: [] },
  sex: { enabled: true, slots: ['14:00', '16:00', '18:00'] },
  sab: { enabled: true, slots: ['08:00', '10:00'] },
};

export default function TutorAvailabilityScreen() {
  const [availability, setAvailability] = useState<Availability>(DEFAULT_AVAIL);
  const [saved, setSaved] = useState(false);

  const toggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
    setSaved(false);
  };

  const toggleSlot = (day: string, slot: string) => {
    setAvailability(prev => {
      const current = prev[day].slots;
      const updated = current.includes(slot)
        ? current.filter(s => s !== slot)
        : [...current, slot].sort();
      return { ...prev, [day]: { ...prev[day], slots: updated } };
    });
    setSaved(false);
  };

  const totalSlots = Object.values(availability).reduce((acc, d) => acc + (d.enabled ? d.slots.length : 0), 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Disponibilidade</Text>
        <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Defina os seus horários para receber aulas.</Text>
      </View>

      {/* Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#4f46e5' }}>
              {Object.values(availability).filter(d => d.enabled).length}
            </Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Dias activos</Text>
          </View>
          <View style={{ width: 1, backgroundColor: '#f3f4f6' }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#10b981' }}>{totalSlots}</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Horários</Text>
          </View>
          <View style={{ width: 1, backgroundColor: '#f3f4f6' }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#f97316' }}>{totalSlots * 1.5}h</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Por semana</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Day by Day */}
      {WEEK_DAYS.map(({ key, label }) => (
        <Card key={key} style={[styles.dayCard, !availability[key].enabled && { opacity: 0.5 }]}>
          <Card.Content>
            <View style={styles.dayHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.dayIcon, availability[key].enabled && { backgroundColor: '#eef2ff' }]}>
                  <Text style={{ fontWeight: '800', fontSize: 13, color: availability[key].enabled ? '#4f46e5' : '#9ca3af' }}>
                    {key.toUpperCase()}
                  </Text>
                </View>
                <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827' }}>{label}</Text>
              </View>
              <Switch
                value={availability[key].enabled}
                onValueChange={() => toggleDay(key)}
                color="#4f46e5"
              />
            </View>

            {availability[key].enabled && (
              <View style={styles.slotsGrid}>
                {TIME_SLOTS.map(slot => {
                  const active = availability[key].slots.includes(slot);
                  return (
                    <TouchableOpacity
                      key={slot}
                      onPress={() => toggleSlot(key, slot)}
                      style={[styles.slotChip, active && styles.slotChipActive]}
                    >
                      <Text style={[styles.slotText, active && { color: '#fff' }]}>{slot}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Card.Content>
        </Card>
      ))}

      {/* Save */}
      <Button
        mode="contained"
        onPress={() => setSaved(true)}
        style={styles.saveBtn}
        labelStyle={{ fontWeight: '800', color: '#fff', fontSize: 15 }}
        contentStyle={{ paddingVertical: 8 }}
        icon={saved ? 'check' : undefined}
      >
        {saved ? 'Guardado!' : 'Guardar Disponibilidade'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 20 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 20 },
  dayCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dayIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  slotChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f3f4f6' },
  slotChipActive: { backgroundColor: '#4f46e5' },
  slotText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  saveBtn: { backgroundColor: '#4f46e5', borderRadius: 16, elevation: 4, marginTop: 8 },
});
