import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert, ActivityIndicator, Switch, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';

// ── STORAGE KEYS ───────────────────────────────────────────────────────────────
const STORAGE_KEY    = 'SEK_VB_complaints';
const USERS_KEY      = 'SEK_VB_users';
const SETTINGS_KEY   = 'SEK_VB_settings';
const REPORTS_KEY    = 'SEK_VB_saved_reports';
const MAX_COMPLAINTS = 100;

// ── NOTIFICATION SETUP ─────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

// ── TRANSLATIONS ───────────────────────────────────────────────────────────────
const T = {
  en: {
    appName: 'SEK_VB', appSub: 'Vehicle Inspection System',
    login: 'Login', loginBtn: 'Login →', email: 'Email', password: 'Password',
    emailPh: 'Enter Email', passPh: 'Enter Password', loginFail: 'Login Failed',
    loginErr: 'Wrong Email or Password!', demoAccounts: 'Demo Accounts',
    newInspection: 'New Inspection', logout: 'Logout', inspector: 'Inspector',
    dateTime: 'Date & Time', vehicleDetails: 'Vehicle Details',
    vehicleNo: 'Vehicle Number *', ownerName: 'Owner Name *',
    vehicleType: 'Vehicle Type', problem: 'Vehicle Problem *',
    problemPh: 'Write problem here...', photos: 'Before & After Photos',
    before: 'Before', after: 'After', uploadPh: 'Upload',
    generateReport: 'Generate Report →', fillVehicleNo: 'Enter Vehicle Number!',
    fillOwner: 'Enter Owner Name!', fillProblem: 'Write Problem!',
    reportPreview: 'Report Preview', back: '← Back',
    saved: 'Saved!', savePDF: 'Save / Share PDF', print: 'Print',
    newInsp: '+ New Inspection', role: 'Role', status: 'Status',
    adminPanel: 'Admin Panel', dashboard: '📊 Dashboard', users: '👥 Users',
    complaints: '📋 Complaints', settings: '⚙️ Settings',
    total: 'Total', pending: 'Pending', complete: 'Complete', reopen: 'Re-open',
    completionRate: '📈 Completion Rate', storage: '💾 Storage',
    vehicleBreakdown: '🚘 Vehicle Breakdown', recent5: '🕐 Recent 5',
    noComplaints: 'No complaints yet', addUser: '+ Add New User',
    cancel: 'Cancel', newUser: '👤 New User', name: 'Name *',
    saveUser: '✓ Save User', deleteUser: 'Delete User',
    deleteUserQ: 'Delete this user?', delete: 'Delete',
    userAdded: ' user added!', allFields: 'Fill all fields!',
    emailExists: 'This Email already exists!',
    markComplete: '✓ Complete', markReopen: '↩️ Re-open', markDelete: '🗑️ Delete',
    deleteComplaintQ: 'Delete this complaint?',
    searchPh: 'Search by vehicle no, owner...', filterAll: 'All',
    filterPending: 'Pending', filterComplete: 'Complete',
    darkMode: 'Dark Mode', language: 'Language', notifications: 'Notifications',
    backupRestore: '💾 Backup & Restore', backup: 'Backup Data',
    restore: 'Restore Data', backupSuccess: 'Backup successful!',
    restoreSuccess: 'Restore successful!', restoreFail: 'Restore failed!',
    notifEnabled: 'Notifications enabled!', notifDisabled: 'Notifications disabled!',
    pendingReminder: 'Pending Complaints Reminder',
    pendingReminderBody: ' complaints are still pending. Please review.',
    myComplaints: '📋 My Complaints', assignedTo: 'Assigned To',
    supervisor: 'Supervisor', technician: 'Technician',
    camera: 'Camera', gallery: 'Gallery',
    noPermCamera: 'Allow Camera in Settings.',
    noPermGallery: 'Allow Gallery in Settings.',
    storedOf: ' / ', stored: ' stored',
    completeLabel: 'Complete', pendingLabel: 'Pending', reopenLabel: 'Re-opened',
    pdfError: 'PDF Error', printError: 'Print Error',
    saveReport: '💾 Save Report', reportSaved: 'Report Saved!',
    savedReports: '📁 Saved Reports', noSavedReports: 'No saved reports yet',
    exportAllPDF: '📄 Export All as PDF', exportCSV: '📊 Export as CSV/Excel',
    deleteReport: 'Delete Report', deleteReportQ: 'Delete this saved report?',
    reportsList: 'Reports List', exportingPDF: 'Generating PDF...',
    allReports: 'All Reports', viewReport: 'View',
  },
  mr: {
    appName: 'SEK_VB', appSub: 'वाहन तपासणी प्रणाली',
    login: 'लॉगिन', loginBtn: 'लॉगिन करा →', email: 'ईमेल', password: 'पासवर्ड',
    emailPh: 'ईमेल टाका', passPh: 'पासवर्ड टाका', loginFail: 'लॉगिन अयशस्वी',
    loginErr: 'चुकीचा ईमेल किंवा पासवर्ड!', demoAccounts: 'डेमो खाती',
    newInspection: 'नवीन तपासणी', logout: 'लॉगआउट', inspector: 'निरीक्षक',
    dateTime: 'तारीख आणि वेळ', vehicleDetails: 'वाहन माहिती',
    vehicleNo: 'वाहन क्रमांक *', ownerName: 'मालकाचे नाव *',
    vehicleType: 'वाहनाचा प्रकार', problem: 'वाहनाची समस्या *',
    problemPh: 'समस्या इथे लिहा...', photos: 'आधी आणि नंतरचे फोटो',
    before: 'आधी', after: 'नंतर', uploadPh: 'अपलोड करा',
    generateReport: 'रिपोर्ट तयार करा →', fillVehicleNo: 'वाहन क्रमांक भरा!',
    fillOwner: 'मालकाचे नाव भरा!', fillProblem: 'समस्या लिहा!',
    reportPreview: 'रिपोर्ट पूर्वावलोकन', back: '← मागे',
    saved: 'जतन झाले!', savePDF: 'PDF जतन / शेअर करा', print: 'प्रिंट करा',
    newInsp: '+ नवीन तपासणी', role: 'भूमिका', status: 'स्थिती',
    adminPanel: 'प्रशासक पॅनल', dashboard: '📊 डॅशबोर्ड', users: '👥 वापरकर्ते',
    complaints: '📋 तक्रारी', settings: '⚙️ सेटिंग्ज',
    total: 'एकूण', pending: 'प्रलंबित', complete: 'पूर्ण', reopen: 'पुन्हा उघडा',
    completionRate: '📈 पूर्णता दर', storage: '💾 साठवण',
    vehicleBreakdown: '🚘 वाहन प्रकार', recent5: '🕐 अलीकडील 5',
    noComplaints: 'अजून तक्रारी नाहीत', addUser: '+ नवीन वापरकर्ता जोडा',
    cancel: 'रद्द करा', newUser: '👤 नवीन वापरकर्ता', name: 'नाव *',
    saveUser: '✓ वापरकर्ता जतन करा', deleteUser: 'वापरकर्ता हटवा',
    deleteUserQ: 'हा वापरकर्ता हटवायचा का?', delete: 'हटवा',
    userAdded: ' वापरकर्ता जोडला!', allFields: 'सर्व फील्ड भरा!',
    emailExists: 'हा ईमेल आधीच आहे!',
    markComplete: '✓ पूर्ण', markReopen: '↩️ पुन्हा उघडा', markDelete: '🗑️ हटवा',
    deleteComplaintQ: 'ही तक्रार हटवायची का?',
    searchPh: 'वाहन क्र., मालक शोधा...', filterAll: 'सर्व',
    filterPending: 'प्रलंबित', filterComplete: 'पूर्ण',
    darkMode: 'डार्क मोड', language: 'भाषा', notifications: 'सूचना',
    backupRestore: '💾 बॅकअप आणि पुनर्संचयित', backup: 'डेटा बॅकअप करा',
    restore: 'डेटा पुनर्संचयित करा', backupSuccess: 'बॅकअप यशस्वी!',
    restoreSuccess: 'पुनर्संचयित यशस्वी!', restoreFail: 'पुनर्संचयित अयशस्वी!',
    notifEnabled: 'सूचना सक्षम!', notifDisabled: 'सूचना अक्षम!',
    pendingReminder: 'प्रलंबित तक्रारी स्मरणपत्र',
    pendingReminderBody: ' तक्रारी अजून प्रलंबित आहेत. कृपया तपासा.',
    myComplaints: '📋 माझ्या तक्रारी', assignedTo: 'नियुक्त केलेले',
    supervisor: 'पर्यवेक्षक', technician: 'तंत्रज्ञ',
    camera: 'कॅमेरा', gallery: 'गॅलरी',
    noPermCamera: 'सेटिंग्जमध्ये कॅमेरा परवानगी द्या.',
    noPermGallery: 'सेटिंग्जमध्ये गॅलरी परवानगी द्या.',
    storedOf: ' / ', stored: ' जतन',
    completeLabel: 'पूर्ण', pendingLabel: 'प्रलंबित', reopenLabel: 'पुन्हा उघडले',
    pdfError: 'PDF त्रुटी', printError: 'प्रिंट त्रुटी',
    saveReport: '💾 रिपोर्ट जतन करा', reportSaved: 'रिपोर्ट जतन झाला!',
    savedReports: '📁 जतन केलेले रिपोर्ट', noSavedReports: 'अजून कोणताही रिपोर्ट जतन केला नाही',
    exportAllPDF: '📄 सर्व PDF मध्ये निर्यात करा', exportCSV: '📊 CSV/Excel मध्ये निर्यात करा',
    deleteReport: 'रिपोर्ट हटवा', deleteReportQ: 'हा जतन केलेला रिपोर्ट हटवायचा का?',
    reportsList: 'रिपोर्ट यादी', exportingPDF: 'PDF तयार होत आहे...',
    allReports: 'सर्व रिपोर्ट', viewReport: 'पहा',
  },
};

// ── DEFAULT DATA ───────────────────────────────────────────────────────────────
const DEFAULT_USERS = [
  { id: 1, name: 'Admin',        email: 'admin@workshop.com',  password: 'admin123', role: 'Admin' },
  { id: 2, name: 'Rahul Patil',  email: 'rahul@workshop.com',  password: '1234',     role: 'Inspector' },
  { id: 3, name: 'Suresh Desai', email: 'suresh@workshop.com', password: '1234',     role: 'Manager' },
  { id: 4, name: 'Amit Shinde',  email: 'amit@workshop.com',   password: '1234',     role: 'Technician' },
];

const DEFAULT_SETTINGS = { darkMode: false, lang: 'en', notifications: true };

const VEHICLE_TYPES = ['BIN WASHER','BOB CAT','BOV','City Hook Loader','HMV Tipper',
  'ISUZU','JCB','PC LMV TIPPER','REFUSE COMPACTOR','ROAD SWEEPER','Other'];
const ROLES = ['Inspector','Manager','Technician'];

function getNow() {
  return new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

// ── STORAGE HELPERS ────────────────────────────────────────────────────────────
async function loadComplaints() {
  try { const r = await AsyncStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
async function saveComplaints(list) {
  try {
    const trimmed = list.slice(-MAX_COMPLAINTS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch { return list; }
}
async function loadUsers() {
  try { const r = await AsyncStorage.getItem(USERS_KEY); return r ? JSON.parse(r) : DEFAULT_USERS; }
  catch { return DEFAULT_USERS; }
}
async function saveUsers(list) {
  try { await AsyncStorage.setItem(USERS_KEY, JSON.stringify(list)); } catch {}
}
async function loadSettings() {
  try { const r = await AsyncStorage.getItem(SETTINGS_KEY); return r ? { ...DEFAULT_SETTINGS, ...JSON.parse(r) } : DEFAULT_SETTINGS; }
  catch { return DEFAULT_SETTINGS; }
}
async function saveSettings(s) {
  try { await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}
async function loadSavedReports() {
  try { const r = await AsyncStorage.getItem(REPORTS_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
async function saveSavedReports(list) {
  try { await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(list)); return list; }
  catch { return list; }
}

// ── THEME ──────────────────────────────────────────────────────────────────────
function makeTheme(dark) {
  return {
    bg:      dark ? '#0d1117' : '#f0f2f5',
    card:    dark ? '#1c2128' : '#ffffff',
    header:  dark ? '#161b22' : '#1a1a2e',
    text:    dark ? '#e6edf3' : '#1a1a2e',
    sub:     dark ? '#8b949e' : '#555555',
    border:  dark ? '#30363d' : '#e8e8e8',
    input:   dark ? '#0d1117' : '#fafafa',
    accent:  '#e63946',
    green:   '#2a9d8f',
    amber:   '#f4a261',
    blue:    '#457b9d',
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin, settings }) {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [users, setUsers] = useState(DEFAULT_USERS);
  const t = T[settings.lang];
  const th = makeTheme(settings.darkMode);

  useEffect(() => { loadUsers().then(setUsers); }, []);

  function handleLogin() {
    const user = users.find(u => u.email === email.trim() && u.password === pass);
    if (user) onLogin(user);
    else Alert.alert(t.loginFail, t.loginErr);
  }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: th.header }}>
      <ScrollView contentContainerStyle={{ flexGrow:1, justifyContent:'center', padding:20, backgroundColor: th.header }}>
        <View style={{ alignItems:'center', marginBottom:28 }}>
          <Text style={{ fontSize:52, marginBottom:8 }}>🚗</Text>
          <Text style={{ fontSize:28, fontWeight:'800', color:'#fff' }}>{t.appName}</Text>
          <Text style={{ fontSize:14, color:'#8888aa', marginTop:4 }}>{t.appSub}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: th.card }]}>
          <Text style={[styles.cardTitle, { color: th.text }]}>{t.login}</Text>
          <Text style={[styles.label, { color: th.sub }]}>{t.email}</Text>
          <TextInput style={[styles.input, { backgroundColor: th.input, borderColor: th.border, color: th.text }]}
            placeholder={t.emailPh} placeholderTextColor="#aaa"
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
          <Text style={[styles.label, { color: th.sub }]}>{t.password}</Text>
          <TextInput style={[styles.input, { backgroundColor: th.input, borderColor: th.border, color: th.text }]}
            placeholder={t.passPh} placeholderTextColor="#aaa"
            value={pass} onChangeText={setPass} secureTextEntry/>
          <TouchableOpacity style={styles.btn} onPress={handleLogin}>
            <Text style={styles.btnText}>{t.loginBtn}</Text>
          </TouchableOpacity>
          <View style={{ marginTop:18, backgroundColor: th.bg, borderRadius:10, padding:14 }}>
            <Text style={{ fontSize:12, fontWeight:'700', color: th.sub, marginBottom:8 }}>{t.demoAccounts}</Text>
            {users.map(u => (
              <TouchableOpacity key={u.id} onPress={() => { setEmail(u.email); setPass(u.password); }}>
                <Text style={{ fontSize:12, color: th.accent, marginBottom:5, fontWeight:'500' }}>
                  {u.role === 'Admin' ? '👑' : '👤'} {u.name} ({u.role}) — {u.email}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function AdminScreen({ user, onLogout, complaints, onComplaintAction, settings, onSettingsChange, savedReports, onDeleteSavedReport }) {
  const [tab, setTab]             = useState('dashboard');
  const [users, setUsers]         = useState([]);
  const [showAddUser, setShowAdd] = useState(false);
  const [newName,  setNewName]    = useState('');
  const [newEmail, setNewEmail]   = useState('');
  const [newPass,  setNewPass]    = useState('');
  const [newRole,  setNewRole]    = useState('Inspector');
  const [search,   setSearch]     = useState('');
  const [filter,   setFilter]     = useState('All');
  const t = T[settings.lang];
  const th = makeTheme(settings.darkMode);

  useEffect(() => { loadUsers().then(setUsers); }, []);

  async function handleAddUser() {
    if (!newName.trim() || !newEmail.trim() || !newPass.trim()) { Alert.alert('Error', t.allFields); return; }
    if (users.find(u => u.email === newEmail.trim())) { Alert.alert('Error', t.emailExists); return; }
    const nu = { id: Date.now(), name: newName.trim(), email: newEmail.trim().toLowerCase(), password: newPass, role: newRole };
    const updated = [...users, nu];
    await saveUsers(updated); setUsers(updated);
    setNewName(''); setNewEmail(''); setNewPass(''); setNewRole('Inspector'); setShowAdd(false);
    Alert.alert('✓', nu.name + t.userAdded);
  }

  async function handleDeleteUser(uid) {
    Alert.alert(t.deleteUser, t.deleteUserQ, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: async () => {
        const updated = users.filter(u => u.id !== uid);
        await saveUsers(updated); setUsers(updated);
      }},
    ]);
  }

  // Filtered complaints
  const filtered = complaints.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.vehicleNo.toLowerCase().includes(q) || c.ownerName.toLowerCase().includes(q);
    const matchFilter = filter === 'All' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const total    = complaints.length;
  const pending  = complaints.filter(c => c.status === 'Pending').length;
  const complete = complaints.filter(c => c.status === 'Complete').length;
  const reopened = complaints.filter(c => c.status === 'Re-opened').length;
  const byType   = VEHICLE_TYPES.map(t2 => ({ type: t2, count: complaints.filter(c => c.vehicleType === t2).length })).filter(x => x.count > 0);

  // Backup
  async function handleBackup() {
    try {
      const data = JSON.stringify({ complaints, users, exportedAt: new Date().toISOString() }, null, 2);
      const path = FileSystem.documentDirectory + 'sekvb_backup.json';
      await FileSystem.writeAsStringAsync(path, data);
      await Sharing.shareAsync(path, { mimeType:'application/json', dialogTitle: t.backup });
      Alert.alert('✓', t.backupSuccess);
    } catch(e) { Alert.alert('Error', e.message); }
  }

  async function handleRestore() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All });
      Alert.alert('Info', 'Please share a backup JSON file via Files app to restore.');
    } catch(e) { Alert.alert('Error', t.restoreFail); }
  }

  // Notifications
  async function toggleNotifications(val) {
    if (val) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Error', 'Notification permission denied'); return; }
      if (pending > 0) {
        await Notifications.scheduleNotificationAsync({
          content: { title: t.pendingReminder, body: pending + t.pendingReminderBody },
          trigger: { seconds: 2 },
        });
      }
      Alert.alert('✓', t.notifEnabled);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert('✓', t.notifDisabled);
    }
    onSettingsChange({ ...settings, notifications: val });
  }

  const tabs = [
    { key:'dashboard', label: t.dashboard },
    { key:'users',     label: t.users },
    { key:'complaints',label: t.complaints },
    { key:'reports',   label: '📁 Reports' },
    { key:'settings',  label: t.settings },
  ];

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: th.bg }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: th.header }]}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
          <Text style={{ fontSize:20 }}>👑</Text>
          <View>
            <Text style={styles.headerTitle}>{t.adminPanel}</Text>
            <Text style={styles.headerSub}>{user.name}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={{ flexDirection:'row', backgroundColor: th.header, paddingHorizontal:6, paddingBottom:8, paddingTop:4 }}>
        {tabs.map(tb => (
          <TouchableOpacity key={tb.key} style={[styles.tab, tab===tb.key && styles.tabActive]}
            onPress={() => setTab(tb.key)}>
            <Text style={[styles.tabText, tab===tb.key && styles.tabTextActive]}>{tb.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex:1, padding:14 }} showsVerticalScrollIndicator={false}>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <View>
            <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
              <View style={[styles.statCard, { backgroundColor:'#1a1a2e', flex:1 }]}>
                <Text style={styles.statNum}>{total}</Text>
                <Text style={styles.statLabel}>{t.total}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: th.accent, flex:1 }]}>
                <Text style={styles.statNum}>{pending}</Text>
                <Text style={styles.statLabel}>{t.pending}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: th.green, flex:1 }]}>
                <Text style={styles.statNum}>{complete}</Text>
                <Text style={styles.statLabel}>{t.complete}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: th.blue, flex:1 }]}>
                <Text style={styles.statNum}>{reopened}</Text>
                <Text style={styles.statLabel}>{t.reopen}</Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: th.card, marginBottom:12 }]}>
              <Text style={styles.sectionTitle}>{t.completionRate}</Text>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: total>0 ? (complete/total*100)+'%' : '0%' }]}/>
              </View>
              <Text style={{ textAlign:'center', marginTop:6, fontWeight:'700', color: th.green }}>
                {total>0 ? Math.round(complete/total*100) : 0}% Complete
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: th.card, marginBottom:12 }]}>
              <Text style={styles.sectionTitle}>{t.storage}</Text>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width:(total/MAX_COMPLAINTS*100)+'%', backgroundColor: th.amber }]}/>
              </View>
              <Text style={{ textAlign:'center', marginTop:6, fontWeight:'700', color: th.amber }}>
                {total}{t.storedOf}{MAX_COMPLAINTS}{t.stored}
              </Text>
            </View>

            {byType.length > 0 && (
              <View style={[styles.card, { backgroundColor: th.card, marginBottom:12 }]}>
                <Text style={styles.sectionTitle}>{t.vehicleBreakdown}</Text>
                {byType.map(x => (
                  <View key={x.type} style={{ marginBottom:8 }}>
                    <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:3 }}>
                      <Text style={{ fontSize:13, color: th.sub, fontWeight:'600' }}>{x.type}</Text>
                      <Text style={{ fontSize:13, fontWeight:'700', color: th.text }}>{x.count}</Text>
                    </View>
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFill, { width:(x.count/total*100)+'%', backgroundColor: th.blue }]}/>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.card, { backgroundColor: th.card, marginBottom:12 }]}>
              <Text style={styles.sectionTitle}>{t.recent5}</Text>
              {complaints.slice(-5).reverse().map(c => (
                <View key={c.id} style={[styles.complaintRow, { borderBottomColor: th.border }]}>
                  <View style={{ flex:1 }}>
                    <Text style={{ fontWeight:'700', fontSize:13, color: th.text }}>#{c.id} — {c.vehicleNo}</Text>
                    <Text style={{ fontSize:11, color: th.sub }}>{c.ownerName} · {c.datetime}</Text>
                  </View>
                  <StatusBadge status={c.status} t={t}/>
                </View>
              ))}
              {complaints.length === 0 && <Text style={{ color: th.sub, textAlign:'center' }}>{t.noComplaints}</Text>}
            </View>
          </View>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <View>
            <TouchableOpacity style={[styles.btn, { marginBottom:14 }]} onPress={() => setShowAdd(!showAddUser)}>
              <Text style={styles.btnText}>{showAddUser ? '✕ ' + t.cancel : t.addUser}</Text>
            </TouchableOpacity>
            {showAddUser && (
              <View style={[styles.card, { backgroundColor: th.card, marginBottom:14 }]}>
                <Text style={styles.sectionTitle}>{t.newUser}</Text>
                <Text style={[styles.label, { color: th.sub }]}>{t.name}</Text>
                <TextInput style={[styles.input, { backgroundColor: th.input, borderColor: th.border, color: th.text }]}
                  placeholder="Full Name" placeholderTextColor="#bbb" value={newName} onChangeText={setNewName}/>
                <Text style={[styles.label, { color: th.sub }]}>{t.email}</Text>
                <TextInput style={[styles.input, { backgroundColor: th.input, borderColor: th.border, color: th.text }]}
                  placeholder="email@workshop.com" placeholderTextColor="#bbb"
                  value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" autoCapitalize="none"/>
                <Text style={[styles.label, { color: th.sub }]}>{t.password}</Text>
                <TextInput style={[styles.input, { backgroundColor: th.input, borderColor: th.border, color: th.text }]}
                  placeholder="Password" placeholderTextColor="#bbb" value={newPass} onChangeText={setNewPass}/>
                <Text style={[styles.label, { color: th.sub }]}>{t.role}</Text>
                <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
                  {ROLES.map(r => (
                    <TouchableOpacity key={r} style={[styles.chip, newRole===r && styles.chipActive]} onPress={() => setNewRole(r)}>
                      <Text style={[styles.chipText, newRole===r && { color:'#fff' }]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.btn} onPress={handleAddUser}>
                  <Text style={styles.btnText}>{t.saveUser}</Text>
                </TouchableOpacity>
              </View>
            )}
            {users.map(u => (
              <View key={u.id} style={[styles.card, { backgroundColor: th.card, marginBottom:10, flexDirection:'row', alignItems:'center' }]}>
                <View style={[styles.avatarCircle, { backgroundColor: th.bg }]}>
                  <Text style={{ fontSize:18 }}>{u.role==='Admin'?'👑':u.role==='Manager'?'💼':u.role==='Inspector'?'🔍':'🔧'}</Text>
                </View>
                <View style={{ flex:1, marginLeft:12 }}>
                  <Text style={{ fontWeight:'700', fontSize:14, color: th.text }}>{u.name}</Text>
                  <Text style={{ fontSize:12, color: th.sub }}>{u.email}</Text>
                  <View style={[styles.badge, { alignSelf:'flex-start', marginTop:4,
                    backgroundColor: u.role==='Admin'?'#ffd700':'#e8f4fd' }]}>
                    <Text style={{ fontSize:10, fontWeight:'700', color: u.role==='Admin'?'#7d5700':'#1a6fa8' }}>{u.role}</Text>
                  </View>
                </View>
                {u.role !== 'Admin' && (
                  <TouchableOpacity onPress={() => handleDeleteUser(u.id)} style={{ padding:8 }}>
                    <Text style={{ color: th.accent, fontSize:18 }}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── COMPLAINTS ── */}
        {tab === 'complaints' && (
          <View>
            {/* Search */}
            <TextInput
              style={[styles.input, { backgroundColor: th.card, borderColor: th.border, color: th.text, marginBottom:10 }]}
              placeholder={t.searchPh} placeholderTextColor="#aaa"
              value={search} onChangeText={setSearch}/>
            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:12 }}>
              {['All','Pending','Complete','Re-opened'].map(f => (
                <TouchableOpacity key={f} style={[styles.chip, filter===f && styles.chipActive, { marginRight:8 }]}
                  onPress={() => setFilter(f)}>
                  <Text style={[styles.chipText, filter===f && { color:'#fff' }]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={{ color: th.sub, fontSize:12, marginBottom:10, textAlign:'center' }}>
              {filtered.length}{t.storedOf}{total}{t.stored}
            </Text>

            {filtered.length === 0 && (
              <View style={[styles.card, { backgroundColor: th.card, alignItems:'center', padding:30 }]}>
                <Text style={{ fontSize:40 }}>📋</Text>
                <Text style={{ color: th.sub, marginTop:8 }}>{t.noComplaints}</Text>
              </View>
            )}

            {[...filtered].reverse().map(c => (
              <View key={c.id} style={[styles.card, { backgroundColor: th.card, marginBottom:10 }]}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <Text style={{ fontWeight:'800', fontSize:15, color: th.accent }}>#{c.id} — {c.vehicleNo}</Text>
                  <StatusBadge status={c.status} t={t}/>
                </View>
                <Text style={{ fontSize:13, color: th.sub }}>👤 {c.ownerName} · 🚘 {c.vehicleType}</Text>
                {c.supervisor && <Text style={{ fontSize:12, color: th.sub, marginTop:2 }}>👷 {c.supervisor}</Text>}
                {c.technician && <Text style={{ fontSize:12, color: th.sub }}>🔧 {c.technician}</Text>}
                <Text style={{ fontSize:12, color: th.sub, marginTop:2 }}>🕐 {c.datetime}</Text>
                <Text style={{ fontSize:12, color: th.text, marginTop:4 }} numberOfLines={2}>🔧 {c.problem}</Text>
                <View style={{ flexDirection:'row', gap:6, marginTop:10, flexWrap:'wrap' }}>
                  {c.status !== 'Complete' && (
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: th.green }]}
                      onPress={() => onComplaintAction(c.id, 'Complete')}>
                      <Text style={styles.smallBtnText}>{t.markComplete}</Text>
                    </TouchableOpacity>
                  )}
                  {c.status === 'Complete' && (
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: th.blue }]}
                      onPress={() => onComplaintAction(c.id, 'Re-open')}>
                      <Text style={styles.smallBtnText}>{t.markReopen}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: th.accent }]}
                    onPress={() => onComplaintAction(c.id, 'delete')}>
                    <Text style={styles.smallBtnText}>{t.markDelete}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── REPORTS ── */}
        {tab === 'reports' && (
          <AdminReportsView savedReports={savedReports} settings={settings} th={th} t={t}
            onDeleteReport={onDeleteSavedReport}/>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <View>
            <View style={[styles.card, { backgroundColor: th.card, marginBottom:12 }]}>
              <Text style={styles.sectionTitle}>🎨 {t.settings}</Text>

              {/* Dark Mode */}
              <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:12, borderBottomWidth:1, borderBottomColor: th.border }}>
                <Text style={{ fontSize:15, color: th.text, fontWeight:'600' }}>🌙 {t.darkMode}</Text>
                <Switch value={settings.darkMode} onValueChange={v => onSettingsChange({ ...settings, darkMode: v })}
                  trackColor={{ false:'#ccc', true: th.accent }} thumbColor="#fff"/>
              </View>

              {/* Language */}
              <View style={{ paddingVertical:12, borderBottomWidth:1, borderBottomColor: th.border }}>
                <Text style={{ fontSize:15, color: th.text, fontWeight:'600', marginBottom:10 }}>🌐 {t.language}</Text>
                <View style={{ flexDirection:'row', gap:10 }}>
                  {[{k:'en',l:'English'},{k:'mr',l:'मराठी'}].map(({ k, l }) => (
                    <TouchableOpacity key={k} style={[styles.chip, settings.lang===k && styles.chipActive]}
                      onPress={() => onSettingsChange({ ...settings, lang: k })}>
                      <Text style={[styles.chipText, settings.lang===k && { color:'#fff' }]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notifications */}
              <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:12 }}>
                <Text style={{ fontSize:15, color: th.text, fontWeight:'600' }}>🔔 {t.notifications}</Text>
                <Switch value={settings.notifications} onValueChange={toggleNotifications}
                  trackColor={{ false:'#ccc', true: th.accent }} thumbColor="#fff"/>
              </View>
            </View>

            {/* Backup & Restore */}
            <View style={[styles.card, { backgroundColor: th.card, marginBottom:12 }]}>
              <Text style={styles.sectionTitle}>{t.backupRestore}</Text>
              <TouchableOpacity style={[styles.btn, { marginBottom:10 }]} onPress={handleBackup}>
                <Text style={styles.btnText}>📤 {t.backup}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor:'#1a1a2e' }]} onPress={handleRestore}>
                <Text style={styles.btnText}>📥 {t.restore}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.card, { backgroundColor: th.card, marginBottom:12, alignItems:'center', padding:20 }]}>
              <Text style={{ fontSize:30 }}>🚗</Text>
              <Text style={{ fontSize:16, fontWeight:'800', color: th.text, marginTop:8 }}>SEK_VB</Text>
              <Text style={{ fontSize:12, color: th.sub, marginTop:4 }}>v2.0 — Vehicle Inspection System</Text>
              <Text style={{ fontSize:11, color: th.sub, marginTop:2 }}>Complaints stored: {total} / {MAX_COMPLAINTS}</Text>
            </View>
          </View>
        )}

        <View style={{ height:30 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STAFF SCREEN (Manager / Technician / Inspector view)
// ══════════════════════════════════════════════════════════════════════════════
function StaffScreen({ user, onLogout, complaints, onComplaintAction, settings }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const t = T[settings.lang];
  const th = makeTheme(settings.darkMode);

  const myComplaints = complaints.filter(c => {
    if (user.role === 'Technician') return c.technician === user.name;
    if (user.role === 'Inspector')  return c.inspector  === user.name;
    return true; // Manager sees all
  });

  const filtered = myComplaints.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.vehicleNo.toLowerCase().includes(q) || c.ownerName.toLowerCase().includes(q);
    const matchFilter = filter === 'All' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const pending  = myComplaints.filter(c => c.status === 'Pending').length;
  const complete = myComplaints.filter(c => c.status === 'Complete').length;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: th.bg }}>
      <View style={[styles.header, { backgroundColor: th.header }]}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
          <Text style={{ fontSize:20 }}>{user.role==='Manager'?'💼':user.role==='Inspector'?'🔍':'🔧'}</Text>
          <View>
            <Text style={styles.headerTitle}>{user.role} Dashboard</Text>
            <Text style={styles.headerSub}>{user.name}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex:1, padding:14 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={{ flexDirection:'row', gap:10, marginBottom:14 }}>
          <View style={[styles.statCard, { backgroundColor:'#1a1a2e', flex:1 }]}>
            <Text style={styles.statNum}>{myComplaints.length}</Text>
            <Text style={styles.statLabel}>{t.total}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: th.accent, flex:1 }]}>
            <Text style={styles.statNum}>{pending}</Text>
            <Text style={styles.statLabel}>{t.pending}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: th.green, flex:1 }]}>
            <Text style={styles.statNum}>{complete}</Text>
            <Text style={styles.statLabel}>{t.complete}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t.myComplaints}</Text>

        {/* Search */}
        <TextInput
          style={[styles.input, { backgroundColor: th.card, borderColor: th.border, color: th.text, marginBottom:10 }]}
          placeholder={t.searchPh} placeholderTextColor="#aaa"
          value={search} onChangeText={setSearch}/>

        {/* Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:12 }}>
          {['All','Pending','Complete','Re-opened'].map(f => (
            <TouchableOpacity key={f} style={[styles.chip, filter===f && styles.chipActive, { marginRight:8 }]}
              onPress={() => setFilter(f)}>
              <Text style={[styles.chipText, filter===f && { color:'#fff' }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.length === 0 && (
          <View style={[styles.card, { backgroundColor: th.card, alignItems:'center', padding:30 }]}>
            <Text style={{ fontSize:40 }}>📋</Text>
            <Text style={{ color: th.sub, marginTop:8 }}>{t.noComplaints}</Text>
          </View>
        )}

        {[...filtered].reverse().map(c => (
          <View key={c.id} style={[styles.card, { backgroundColor: th.card, marginBottom:10 }]}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <Text style={{ fontWeight:'800', fontSize:15, color: th.accent }}>#{c.id} — {c.vehicleNo}</Text>
              <StatusBadge status={c.status} t={t}/>
            </View>
            <Text style={{ fontSize:13, color: th.sub }}>👤 {c.ownerName} · 🚘 {c.vehicleType}</Text>
            <Text style={{ fontSize:12, color: th.sub, marginTop:2 }}>🕐 {c.datetime}</Text>
            <Text style={{ fontSize:12, color: th.text, marginTop:4 }} numberOfLines={2}>🔧 {c.problem}</Text>
            {user.role === 'Manager' && (
              <View style={{ flexDirection:'row', gap:6, marginTop:10 }}>
                {c.status !== 'Complete' && (
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: th.green }]}
                    onPress={() => onComplaintAction(c.id, 'Complete')}>
                    <Text style={styles.smallBtnText}>{t.markComplete}</Text>
                  </TouchableOpacity>
                )}
                {c.status === 'Complete' && (
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: th.blue }]}
                    onPress={() => onComplaintAction(c.id, 'Re-open')}>
                    <Text style={styles.smallBtnText}>{t.markReopen}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
        <View style={{ height:30 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INSPECTION FORM
// ══════════════════════════════════════════════════════════════════════════════
function InspectionScreen({ user, onLogout, onReport, complaints, settings, onOpenSavedReports, savedReportsCount }) {
  const [vehicleNo,   setVehicleNo]   = useState('');
  const [ownerName,   setOwnerName]   = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [problem,     setProblem]     = useState('');
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto,  setAfterPhoto]  = useState(null);
  const [supervisor,  setSupervisor]  = useState('');
  const [technician,  setTechnician]  = useState('');
  const [allUsers,    setAllUsers]    = useState([]);

  const t = T[settings.lang];
  const th = makeTheme(settings.darkMode);

  useEffect(() => { loadUsers().then(setAllUsers); }, []);

  const supervisors  = allUsers.filter(u => u.role === 'Manager' || u.role === 'Inspector');
  const technicians  = allUsers.filter(u => u.role === 'Technician');

  async function openSource(type, source) {
    let res;
    const opts = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6, base64: true };
    if (source === 'camera') {
      const p = await ImagePicker.requestCameraPermissionsAsync();
      if (!p.granted) { Alert.alert('Permission', t.noPermCamera); return; }
      res = await ImagePicker.launchCameraAsync(opts);
    } else {
      const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!p.granted) { Alert.alert('Permission', t.noPermGallery); return; }
      res = await ImagePicker.launchImageLibraryAsync(opts);
    }
    if (!res.canceled) {
      const obj = { uri: res.assets[0].uri, b64: 'data:image/jpeg;base64,' + res.assets[0].base64 };
      type === 'before' ? setBeforePhoto(obj) : setAfterPhoto(obj);
    }
  }

  function pickPhoto(type) {
    Alert.alert(type === 'before' ? t.before + ' Photo' : t.after + ' Photo', '', [
      { text: t.camera,  onPress: () => openSource(type, 'camera') },
      { text: t.gallery, onPress: () => openSource(type, 'gallery') },
      { text: t.cancel,  style: 'cancel' },
    ]);
  }

  function handleNext() {
    if (!vehicleNo.trim()) { Alert.alert('Error', t.fillVehicleNo); return; }
    if (!ownerName.trim()) { Alert.alert('Error', t.fillOwner);     return; }
    if (!problem.trim())   { Alert.alert('Error', t.fillProblem);   return; }
    onReport({
      id: Date.now().toString().slice(-6),
      vehicleNo: vehicleNo.toUpperCase(),
      ownerName, vehicleType, problem,
      beforePhoto: beforePhoto?.b64 || null,
      afterPhoto:  afterPhoto?.b64  || null,
      datetime:   getNow(),
      inspector:  user.name,
      supervisor:  supervisor || '',
      technician:  technician || '',
      status: 'Pending',
    });
  }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: th.bg }}>
      <View style={[styles.header, { backgroundColor: th.header }]}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
          <Text style={{ fontSize:22 }}>🚗</Text>
          <View>
            <Text style={styles.headerTitle}>{t.appName}</Text>
            <Text style={styles.headerSub}>{t.newInspection}</Text>
          </View>
        </View>
        <View style={{ flexDirection:'row', gap:6 }}>
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor:'rgba(46,160,120,0.25)', borderColor:'rgba(46,160,120,0.4)' }]}
            onPress={onOpenSavedReports}>
            <Text style={{ color:'#2ea878', fontSize:12, fontWeight:'700' }}>📁 {savedReportsCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>{t.logout}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex:1, padding:14 }} showsVerticalScrollIndicator={false}>
        {/* Inspector info */}
        <View style={[styles.card, { backgroundColor: th.card, flexDirection:'row', justifyContent:'space-between', marginBottom:12 }]}>
          <View>
            <Text style={[styles.label, { color: th.sub }]}>{t.inspector}</Text>
            <Text style={{ fontWeight:'700', fontSize:15, color: th.text }}>{user.name}</Text>
          </View>
          <View style={{ alignItems:'flex-end' }}>
            <Text style={[styles.label, { color: th.sub }]}>{t.dateTime}</Text>
            <Text style={{ fontWeight:'700', fontSize:13, color: th.accent }}>{getNow()}</Text>
          </View>
        </View>

        {/* Vehicle details */}
        <View style={[styles.card, { backgroundColor: th.card, marginBottom:12 }]}>
          <Text style={styles.sectionTitle}>🚘 {t.vehicleDetails}</Text>
          <Text style={[styles.label, { color: th.sub }]}>{t.vehicleNo}</Text>
          <TextInput style={[styles.input, { backgroundColor: th.input, borderColor: th.border, color: th.text }]}
            placeholder="MH12 AB 1234" placeholderTextColor="#bbb"
            value={vehicleNo} onChangeText={t2 => setVehicleNo(t2.toUpperCase())} autoCapitalize="characters"/>
          <Text style={[styles.label, { color: th.sub }]}>{t.ownerName}</Text>
          <TextInput style={[styles.input, { backgroundColor: th.input, borderColor: th.border, color: th.text }]}
            placeholder="Owner Name" placeholderTextColor="#bbb"
            value={ownerName} onChangeText={setOwnerName}/>
          <Text style={[styles.label, { color: th.sub }]}>{t.vehicleType}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {VEHICLE_TYPES.map(vt => (
              <TouchableOpacity key={vt} style={[styles.chip, vehicleType===vt && styles.chipActive]}
                onPress={() => setVehicleType(vt)}>
                <Text style={[styles.chipText, vehicleType===vt && { color:'#fff' }]}>{vt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Supervisor & Technician */}
        <View style={[styles.card, { backgroundColor: th.card, marginBottom:12 }]}>
          <Text style={styles.sectionTitle}>👷 {t.assignedTo}</Text>
          <Text style={[styles.label, { color: th.sub }]}>{t.supervisor}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:10 }}>
            {[{ name:'' }, ...supervisors].map(u2 => (
              <TouchableOpacity key={u2.name || 'none'} style={[styles.chip, supervisor===u2.name && styles.chipActive]}
                onPress={() => setSupervisor(u2.name)}>
                <Text style={[styles.chipText, supervisor===u2.name && { color:'#fff' }]}>{u2.name || 'None'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={[styles.label, { color: th.sub }]}>{t.technician}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[{ name:'' }, ...technicians].map(u2 => (
              <TouchableOpacity key={u2.name || 'none'} style={[styles.chip, technician===u2.name && styles.chipActive]}
                onPress={() => setTechnician(u2.name)}>
                <Text style={[styles.chipText, technician===u2.name && { color:'#fff' }]}>{u2.name || 'None'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Problem */}
        <View style={[styles.card, { backgroundColor: th.card, marginBottom:12 }]}>
          <Text style={styles.sectionTitle}>🔧 {t.problem}</Text>
          <TextInput style={[styles.input, { backgroundColor: th.input, borderColor: th.border, color: th.text, height:100, textAlignVertical:'top' }]}
            placeholder={t.problemPh} placeholderTextColor="#bbb"
            value={problem} onChangeText={setProblem} multiline/>
        </View>

        {/* Photos */}
        <View style={[styles.card, { backgroundColor: th.card, marginBottom:12 }]}>
          <Text style={styles.sectionTitle}>📸 {t.photos}</Text>
          <View style={{ flexDirection:'row', gap:12 }}>
            {[{type:'before', photo:beforePhoto, set:setBeforePhoto},
              {type:'after',  photo:afterPhoto,  set:setAfterPhoto}].map(({ type, photo, set }) => (
              <View key={type} style={{ flex:1 }}>
                <Text style={[styles.label, { color: th.sub, marginBottom:6 }]}>
                  {type==='before' ? '🔴' : '🟢'} {type==='before' ? t.before : t.after}
                </Text>
                <TouchableOpacity style={[styles.photoBox, { borderColor: th.border }]} onPress={() => pickPhoto(type)}>
                  {photo
                    ? <Image source={{ uri: photo.uri }} style={styles.photoImg}/>
                    : <View style={[styles.photoPlaceholder, { backgroundColor: th.input }]}>
                        <Text style={{ fontSize:28 }}>📷</Text>
                        <Text style={{ fontSize:12, color:'#aaa', marginTop:4 }}>{t.uploadPh}</Text>
                      </View>}
                </TouchableOpacity>
                {photo && (
                  <TouchableOpacity onPress={() => set(null)}>
                    <Text style={{ color: th.accent, fontSize:12, textAlign:'center', marginTop:4 }}>✕ Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleNext}>
          <Text style={styles.btnText}>📄 {t.generateReport}</Text>
        </TouchableOpacity>

        {/* ── LAST 30 RECORDS ── */}
        {complaints.length > 0 && (
          <View style={{ marginTop:20 }}>
            <Text style={styles.sectionTitle}>🕐 Recent Records ({Math.min(complaints.length, 30)})</Text>
            {[...complaints].reverse().slice(0, 30).map(c => {
              const statusColors = {
                'Complete':  { bg:'#d4edda', text:'#155724' },
                'Pending':   { bg:'#fff3cd', text:'#856404' },
                'Re-opened': { bg:'#cce5ff', text:'#004085' },
              };
              const sc = statusColors[c.status] || statusColors['Pending'];
              const statusLabel = c.status === 'Complete' ? t.completeLabel : c.status === 'Re-opened' ? t.reopenLabel : t.pendingLabel;
              return (
                <View key={c.id} style={[styles.card, { backgroundColor: th.card, marginBottom:8, padding:12 }]}>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <Text style={{ fontWeight:'800', fontSize:14, color: th.accent }}>#{c.id} — {c.vehicleNo}</Text>
                    <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                      <Text style={{ fontSize:10, fontWeight:'700', color: sc.text }}>{statusLabel}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize:12, color: th.sub }}>👤 {c.ownerName} · 🚘 {c.vehicleType}</Text>
                  <Text style={{ fontSize:11, color: th.sub, marginTop:2 }}>🕐 {c.datetime}</Text>
                  <Text style={{ fontSize:12, color: th.text, marginTop:3 }} numberOfLines={2}>🔧 {c.problem}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height:30 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORT SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function ReportScreen({ user, record, onBack, onNew, settings, onSaveReport, savedReports, onOpenSavedReports, isViewMode }) {
  const [loading,    setLoading]    = useState(false);
  const [isSaved,    setIsSaved]    = useState(false);
  const t = T[settings.lang];
  const th = makeTheme(settings.darkMode);

  // Check if this report is already saved
  useEffect(() => {
    if (savedReports && record) {
      const alreadySaved = savedReports.some(r => r.id === record.id);
      setIsSaved(alreadySaved);
    }
  }, [savedReports, record]);

  async function handleSave() {
    if (!onSaveReport || isSaved) return;
    const count = await onSaveReport(record, user);
    setIsSaved(true);
    Alert.alert('✓', t.reportSaved + '\n' + t.savedReports + ': ' + count);
  }

  async function exportPDF() {
    setLoading(true);
    try {
      const html = buildHTML(record, user);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType:'application/pdf', dialogTitle: t.savePDF });
    } catch(e) { Alert.alert(t.pdfError, e.message); }
    finally { setLoading(false); }
  }

  async function printDirect() {
    try { await Print.printAsync({ html: buildHTML(record, user) }); }
    catch(e) { Alert.alert(t.printError, e.message); }
  }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: th.bg }}>
      <View style={[styles.header, { backgroundColor: th.header }]}>
        <TouchableOpacity onPress={onBack}><Text style={{ color:'#fff', fontSize:15 }}>{t.back}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{isViewMode ? t.savedReports : t.reportPreview}</Text>
        {!isViewMode && onOpenSavedReports ? (
          <TouchableOpacity onPress={onOpenSavedReports}>
            <Text style={{ color:'#2ea878', fontSize:12, fontWeight:'700' }}>📁 {savedReports?.length || 0}</Text>
          </TouchableOpacity>
        ) : <View style={{ width:50 }}/>}
      </View>

      <ScrollView style={{ flex:1, padding:14 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor:'#d4edda', borderRadius:20, alignSelf:'flex-start',
          paddingHorizontal:14, paddingVertical:6, marginBottom:14 }}>
          <Text style={{ color:'#155724', fontWeight:'700' }}>✓ Report #{record.id} — {t.saved}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: th.card, marginBottom:12 }]}>
          <Text style={styles.sectionTitle}>👤 {t.inspector}</Text>
          <Row label={t.name.replace(' *','')} value={user.name} th={th}/>
          <Row label={t.role} value={user.role} th={th}/>
          <Row label={t.dateTime} value={record.datetime} highlight th={th}/>
        </View>

        <View style={[styles.card, { backgroundColor: th.card, marginBottom:12 }]}>
          <Text style={styles.sectionTitle}>🚘 Vehicle</Text>
          <Row label="Vehicle No"  value={record.vehicleNo}   highlight th={th}/>
          <Row label="Owner"       value={record.ownerName}   th={th}/>
          <Row label="Type"        value={record.vehicleType} th={th}/>
          {record.supervisor && <Row label={t.supervisor} value={record.supervisor} th={th}/>}
          {record.technician && <Row label={t.technician} value={record.technician} th={th}/>}
          <Row label={t.status} value={record.status || 'Pending'} th={th}/>
        </View>

        <View style={[styles.card, { backgroundColor: th.card, marginBottom:12 }]}>
          <Text style={styles.sectionTitle}>🔧 Problem</Text>
          <Text style={{ fontSize:14, color: th.text, lineHeight:22 }}>{record.problem}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: th.card, marginBottom:16 }]}>
          <Text style={styles.sectionTitle}>📸 Photos</Text>
          <View style={{ flexDirection:'row', gap:10 }}>
            {[{label:'🔴 ' + t.before, photo:record.beforePhoto},
              {label:'🟢 ' + t.after,  photo:record.afterPhoto}].map(({ label, photo }) => (
              <View key={label} style={{ flex:1 }}>
                <Text style={[styles.label, { color: th.sub, marginBottom:6 }]}>{label}</Text>
                {photo
                  ? <Image source={{ uri:photo }} style={{ width:'100%', height:120, borderRadius:8, resizeMode:'cover' }}/>
                  : <View style={{ height:80, backgroundColor: th.bg, borderRadius:8, alignItems:'center', justifyContent:'center' }}>
                      <Text style={{ color:'#ccc', fontSize:12 }}>No Photo</Text>
                    </View>}
              </View>
            ))}
          </View>
        </View>

        {/* SAVE REPORT BUTTON */}
        {!isViewMode && onSaveReport && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: isSaved ? '#2a9d8f' : '#e63946', marginBottom:10 }]}
            onPress={handleSave} disabled={isSaved}>
            <Text style={styles.btnText}>{isSaved ? '✅ ' + t.reportSaved : t.saveReport}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.btn, { backgroundColor:'#1a1a2e' }]} onPress={exportPDF} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>📄 {t.savePDF}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor:'#457b9d', marginTop:10 }]} onPress={printDirect}>
          <Text style={styles.btnText}>🖨️ {t.print}</Text>
        </TouchableOpacity>
        {!isViewMode && (
          <TouchableOpacity style={[styles.btn, { backgroundColor:'#fff', borderWidth:2,
            borderColor: th.accent, marginTop:10 }]} onPress={onNew}>
            <Text style={[styles.btnText, { color: th.accent }]}>{t.newInsp}</Text>
          </TouchableOpacity>
        )}
        <View style={{ height:30 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN REPORTS VIEW (inline tab for Admin)
// ══════════════════════════════════════════════════════════════════════════════
function AdminReportsView({ savedReports, settings, th, t, onDeleteReport }) {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('All');
  const [loading, setLoading] = useState(false);
  const [loadCSV, setLoadCSV] = useState(false);

  const filtered = (savedReports || []).filter(r => {
    const q = search.toLowerCase();
    const ms = !q || r.vehicleNo.toLowerCase().includes(q) || r.ownerName.toLowerCase().includes(q) || (r.inspector||'').toLowerCase().includes(q);
    const mf = filter === 'All' || r.status === filter;
    return ms && mf;
  });

  async function exportAllPDF() {
    if (!savedReports || savedReports.length === 0) return;
    setLoading(true);
    try {
      const pages = savedReports.map(rec => buildHTML(rec, { name: rec.savedBy || rec.inspector || '', role: rec.savedByRole || '' })).join('<div style="page-break-after:always"></div>');
      const { uri } = await Print.printToFileAsync({ html: '<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body>' + pages + '</body></html>' });
      await Sharing.shareAsync(uri, { mimeType:'application/pdf', dialogTitle: t.exportAllPDF });
    } catch(e) { Alert.alert(t.pdfError, e.message); }
    finally { setLoading(false); }
  }

  async function exportCSV() {
    if (!savedReports || savedReports.length === 0) return;
    setLoadCSV(true);
    try {
      const headers = ['ID','Vehicle No','Owner Name','Vehicle Type','Problem','Status','Inspector','Supervisor','Technician','Date Time','Saved At'];
      const rows = savedReports.map(r => [
        r.id,
        '"' + (r.vehicleNo  ||'').replace(/"/g,'""') + '"',
        '"' + (r.ownerName  ||'').replace(/"/g,'""') + '"',
        '"' + (r.vehicleType||'').replace(/"/g,'""') + '"',
        '"' + (r.problem    ||'').replace(/"/g,'""') + '"',
        r.status||'Pending',
        '"' + (r.inspector  ||r.savedBy||'').replace(/"/g,'""') + '"',
        '"' + (r.supervisor ||'').replace(/"/g,'""') + '"',
        '"' + (r.technician ||'').replace(/"/g,'""') + '"',
        '"' + (r.datetime   ||'').replace(/"/g,'""') + '"',
        '"' + (r.savedAt    ||'').replace(/"/g,'""') + '"',
      ].join(','));
      const csv = headers.join(',') + '\n' + rows.join('\n');
      const path = FileSystem.documentDirectory + 'sekvb_reports_' + Date.now() + '.csv';
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path, { mimeType:'text/csv', dialogTitle: t.exportCSV });
    } catch(e) { Alert.alert('CSV Error', e.message); }
    finally { setLoadCSV(false); }
  }

  const statusColors = { 'Complete':{ bg:'#d4edda',text:'#155724' }, 'Pending':{ bg:'#fff3cd',text:'#856404' }, 'Re-opened':{ bg:'#cce5ff',text:'#004085' } };

  return (
    <View>
      {/* Stats row */}
      <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
        <View style={[styles.statCard, { backgroundColor:'#1a1a2e', flex:1 }]}>
          <Text style={styles.statNum}>{(savedReports||[]).length}</Text>
          <Text style={styles.statLabel}>{t.total} Reports</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor:'#2a9d8f', flex:1 }]}>
          <Text style={styles.statNum}>{(savedReports||[]).filter(r=>r.status==='Complete').length}</Text>
          <Text style={styles.statLabel}>{t.complete}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor:'#e63946', flex:1 }]}>
          <Text style={styles.statNum}>{(savedReports||[]).filter(r=>r.status==='Pending').length}</Text>
          <Text style={styles.statLabel}>{t.pending}</Text>
        </View>
      </View>

      {/* Export buttons */}
      <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
        <TouchableOpacity style={[styles.btn, { flex:1, backgroundColor:'#e63946' }]} onPress={exportAllPDF} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" size="small"/> : <Text style={[styles.btnText,{fontSize:12}]}>{t.exportAllPDF}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { flex:1, backgroundColor:'#2a9d8f' }]} onPress={exportCSV} disabled={loadCSV}>
          {loadCSV ? <ActivityIndicator color="#fff" size="small"/> : <Text style={[styles.btnText,{fontSize:12}]}>{t.exportCSV}</Text>}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput style={[styles.input, { backgroundColor: th.card, borderColor: th.border, color: th.text, marginBottom:8 }]}
        placeholder={t.searchPh} placeholderTextColor="#aaa" value={search} onChangeText={setSearch}/>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:10 }}>
        {['All','Pending','Complete','Re-opened'].map(f => (
          <TouchableOpacity key={f} style={[styles.chip, filter===f && styles.chipActive, { marginRight:8 }]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filter===f && { color:'#fff' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={{ color: th.sub, fontSize:12, marginBottom:10, textAlign:'center', fontWeight:'600' }}>
        {filtered.length} / {(savedReports||[]).length} {t.allReports}
      </Text>

      {filtered.length === 0 && (
        <View style={[styles.card, { backgroundColor: th.card, alignItems:'center', padding:30 }]}>
          <Text style={{ fontSize:40 }}>📁</Text>
          <Text style={{ color: th.sub, marginTop:8 }}>{(savedReports||[]).length===0 ? t.noSavedReports : t.noComplaints}</Text>
        </View>
      )}

      {[...filtered].reverse().map((rep, idx) => {
        const sc = statusColors[rep.status] || statusColors['Pending'];
        const statusLabel = rep.status==='Complete' ? t.completeLabel : rep.status==='Re-opened' ? t.reopenLabel : t.pendingLabel;
        return (
          <View key={rep.id+'_'+idx} style={[styles.card, { backgroundColor: th.card, marginBottom:10 }]}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <Text style={{ fontWeight:'800', fontSize:15, color: th.accent }}>#{rep.id} — {rep.vehicleNo}</Text>
              <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                <Text style={{ fontSize:10, fontWeight:'700', color: sc.text }}>{statusLabel}</Text>
              </View>
            </View>
            <Text style={{ fontSize:13, color: th.text, fontWeight:'600' }}>👤 {rep.ownerName}</Text>
            <Text style={{ fontSize:12, color: th.sub, marginTop:2 }}>🚘 {rep.vehicleType} · 🔍 {rep.inspector||rep.savedBy||''}</Text>
            {rep.supervisor && <Text style={{ fontSize:12, color: th.sub }}>👷 {rep.supervisor}</Text>}
            {rep.technician && <Text style={{ fontSize:12, color: th.sub }}>🔧 {rep.technician}</Text>}
            <Text style={{ fontSize:11, color: th.sub, marginTop:3 }}>🕐 {rep.datetime}</Text>
            <Text style={{ fontSize:12, color: th.text, marginTop:4 }} numberOfLines={2}>📝 {rep.problem}</Text>
            {onDeleteReport && (
              <TouchableOpacity style={[styles.smallBtn, { backgroundColor: th.accent, marginTop:8, alignSelf:'flex-start' }]}
                onPress={() => Alert.alert(t.deleteReport, t.deleteReportQ, [
                  { text: t.cancel, style:'cancel' },
                  { text: t.delete, style:'destructive', onPress: () => onDeleteReport(rep.id) },
                ])}>
                <Text style={styles.smallBtnText}>🗑️ {t.delete}</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SAVED REPORTS SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function SavedReportsScreen({ user, savedReports, settings, onBack, onDeleteReport, onViewReport }) {
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('All');
  const [loading,     setLoading]     = useState(false);
  const [loadingCSV,  setLoadingCSV]  = useState(false);
  const t  = T[settings.lang];
  const th = makeTheme(settings.darkMode);

  const filtered = savedReports.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.vehicleNo.toLowerCase().includes(q) || r.ownerName.toLowerCase().includes(q) || (r.inspector||'').toLowerCase().includes(q);
    const matchFilter = filter === 'All' || r.status === filter;
    return matchSearch && matchFilter;
  });

  // ── Export ALL as single multi-page PDF ──
  async function exportAllPDF() {
    if (savedReports.length === 0) return;
    setLoading(true);
    try {
      const pages = savedReports.map(rec => buildHTML(rec, { name: rec.savedBy || rec.inspector || '', role: rec.savedByRole || '' })).join('<div style="page-break-after:always"></div>');
      const fullHTML = '<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body>' + pages + '</body></html>';
      const { uri } = await Print.printToFileAsync({ html: fullHTML });
      await Sharing.shareAsync(uri, { mimeType:'application/pdf', dialogTitle: t.exportAllPDF });
    } catch(e) { Alert.alert(t.pdfError, e.message); }
    finally { setLoading(false); }
  }

  // ── Export as CSV ──
  async function exportCSV() {
    if (savedReports.length === 0) return;
    setLoadingCSV(true);
    try {
      const headers = ['ID','Vehicle No','Owner Name','Vehicle Type','Problem','Status','Inspector','Supervisor','Technician','Date Time','Saved At'];
      const rows = savedReports.map(r => [
        r.id,
        '"' + (r.vehicleNo  || '').replace(/"/g,'""') + '"',
        '"' + (r.ownerName  || '').replace(/"/g,'""') + '"',
        '"' + (r.vehicleType|| '').replace(/"/g,'""') + '"',
        '"' + (r.problem    || '').replace(/"/g,'""') + '"',
        r.status || 'Pending',
        '"' + (r.inspector  || r.savedBy || '').replace(/"/g,'""') + '"',
        '"' + (r.supervisor || '').replace(/"/g,'""') + '"',
        '"' + (r.technician || '').replace(/"/g,'""') + '"',
        '"' + (r.datetime   || '').replace(/"/g,'""') + '"',
        '"' + (r.savedAt    || '').replace(/"/g,'""') + '"',
      ].join(','));
      const csv = headers.join(',') + '\n' + rows.join('\n');
      const path = FileSystem.documentDirectory + 'sekvb_reports_' + Date.now() + '.csv';
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path, { mimeType:'text/csv', dialogTitle: t.exportCSV });
    } catch(e) { Alert.alert('CSV Error', e.message); }
    finally { setLoadingCSV(false); }
  }

  function confirmDelete(rep) {
    Alert.alert(t.deleteReport, t.deleteReportQ, [
      { text: t.cancel, style:'cancel' },
      { text: t.delete, style:'destructive', onPress: () => onDeleteReport(rep.id) },
    ]);
  }

  const statusColors = {
    'Complete':  { bg:'#d4edda', text:'#155724' },
    'Pending':   { bg:'#fff3cd', text:'#856404' },
    'Re-opened': { bg:'#cce5ff', text:'#004085' },
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: th.bg }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: th.header }]}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color:'#fff', fontSize:15 }}>{t.back}</Text>
        </TouchableOpacity>
        <View style={{ alignItems:'center' }}>
          <Text style={styles.headerTitle}>{t.savedReports}</Text>
          <Text style={{ color:'#8888aa', fontSize:11 }}>{savedReports.length} {t.allReports}</Text>
        </View>
        <View style={{ width:50 }}/>
      </View>

      {/* Export buttons */}
      <View style={{ flexDirection:'row', gap:8, padding:12, paddingBottom:4, backgroundColor: th.header }}>
        <TouchableOpacity
          style={{ flex:1, backgroundColor:'#e63946', borderRadius:10, padding:10, alignItems:'center' }}
          onPress={exportAllPDF} disabled={loading || savedReports.length === 0}>
          {loading
            ? <ActivityIndicator color="#fff" size="small"/>
            : <Text style={{ color:'#fff', fontWeight:'800', fontSize:12 }}>{t.exportAllPDF}</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex:1, backgroundColor:'#2a9d8f', borderRadius:10, padding:10, alignItems:'center' }}
          onPress={exportCSV} disabled={loadingCSV || savedReports.length === 0}>
          {loadingCSV
            ? <ActivityIndicator color="#fff" size="small"/>
            : <Text style={{ color:'#fff', fontWeight:'800', fontSize:12 }}>{t.exportCSV}</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex:1, padding:12 }} showsVerticalScrollIndicator={false}>

        {/* Search */}
        <TextInput
          style={[styles.input, { backgroundColor: th.card, borderColor: th.border, color: th.text, marginBottom:8 }]}
          placeholder={t.searchPh} placeholderTextColor="#aaa"
          value={search} onChangeText={setSearch}/>

        {/* Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:10 }}>
          {['All','Pending','Complete','Re-opened'].map(f => (
            <TouchableOpacity key={f} style={[styles.chip, filter===f && styles.chipActive, { marginRight:8 }]}
              onPress={() => setFilter(f)}>
              <Text style={[styles.chipText, filter===f && { color:'#fff' }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Count */}
        <Text style={{ color: th.sub, fontSize:12, marginBottom:10, textAlign:'center', fontWeight:'600' }}>
          {filtered.length} / {savedReports.length} {t.allReports}
        </Text>

        {filtered.length === 0 && (
          <View style={[styles.card, { backgroundColor: th.card, alignItems:'center', padding:40 }]}>
            <Text style={{ fontSize:48 }}>📁</Text>
            <Text style={{ color: th.sub, marginTop:12, fontSize:14, textAlign:'center' }}>
              {savedReports.length === 0 ? t.noSavedReports : t.noComplaints}
            </Text>
          </View>
        )}

        {[...filtered].reverse().map((rep, idx) => {
          const sc = statusColors[rep.status] || statusColors['Pending'];
          const statusLabel = rep.status === 'Complete' ? t.completeLabel : rep.status === 'Re-opened' ? t.reopenLabel : t.pendingLabel;
          return (
            <View key={rep.id + '_' + (rep.savedAt || idx)}
              style={[styles.card, { backgroundColor: th.card, marginBottom:10 }]}>
              {/* Top row */}
              <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <Text style={{ fontWeight:'800', fontSize:15, color: th.accent }}>#{rep.id} — {rep.vehicleNo}</Text>
                <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                  <Text style={{ fontSize:10, fontWeight:'700', color: sc.text }}>{statusLabel}</Text>
                </View>
              </View>
              {/* Details */}
              <Text style={{ fontSize:13, color: th.text, fontWeight:'600' }}>👤 {rep.ownerName}</Text>
              <Text style={{ fontSize:12, color: th.sub, marginTop:2 }}>🚘 {rep.vehicleType}</Text>
              {rep.inspector && <Text style={{ fontSize:12, color: th.sub, marginTop:1 }}>🔍 {rep.inspector}</Text>}
              {rep.supervisor && <Text style={{ fontSize:12, color: th.sub, marginTop:1 }}>👷 {rep.supervisor}</Text>}
              {rep.technician && <Text style={{ fontSize:12, color: th.sub, marginTop:1 }}>🔧 {rep.technician}</Text>}
              <Text style={{ fontSize:11, color: th.sub, marginTop:3 }}>🕐 {rep.datetime}</Text>
              <Text style={{ fontSize:12, color: th.text, marginTop:4 }} numberOfLines={2}>📝 {rep.problem}</Text>
              {/* Action buttons */}
              <View style={{ flexDirection:'row', gap:8, marginTop:10 }}>
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: th.blue, flex:1 }]}
                  onPress={() => onViewReport(rep)}>
                  <Text style={styles.smallBtnText}>👁️ {t.viewReport}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: th.accent, flex:1 }]}
                  onPress={() => confirmDelete(rep)}>
                  <Text style={styles.smallBtnText}>🗑️ {t.delete}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height:30 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── HELPERS ────────────────────────────────────────────────────────────────────
function StatusBadge({ status, t }) {
  const colors = {
    'Complete':   { bg:'#d4edda', text:'#155724' },
    'Pending':    { bg:'#fff3cd', text:'#856404' },
    'Re-opened':  { bg:'#cce5ff', text:'#004085' },
  };
  const c = colors[status] || colors['Pending'];
  const label = status === 'Complete' ? t.completeLabel : status === 'Re-opened' ? t.reopenLabel : t.pendingLabel;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={{ fontSize:10, fontWeight:'700', color: c.text }}>{label}</Text>
    </View>
  );
}

function Row({ label, value, highlight, th }) {
  return (
    <View style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:8,
      borderBottomWidth:1, borderBottomColor: th?.border || '#f0f0f0' }}>
      <Text style={{ fontSize:13, color: th?.sub || '#888' }}>{label}</Text>
      <Text style={{ fontSize:14, fontWeight:'700', color: highlight ? '#e63946' : (th?.text || '#1a1a2e') }}>{value}</Text>
    </View>
  );
}

function buildHTML(record, user) {
  const beforeImg = record.beforePhoto
    ? '<img src="' + record.beforePhoto + '" style="width:100%;height:200px;object-fit:cover;display:block"/>'
    : '<div class="no-photo">No Photo</div>';
  const afterImg = record.afterPhoto
    ? '<img src="' + record.afterPhoto + '" style="width:100%;height:200px;object-fit:cover;display:block"/>'
    : '<div class="no-photo">No Photo</div>';

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>'
    + 'body{font-family:Arial,sans-serif;padding:30px;color:#1a1a2e}'
    + '.header{display:flex;justify-content:space-between;border-bottom:3px solid #e63946;padding-bottom:12px;margin-bottom:18px}'
    + '.logo{font-size:22px;font-weight:800;color:#e63946}'
    + '.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}'
    + '.cell{background:#f8f9fa;border-radius:8px;padding:12px}'
    + '.cell-label{font-size:10px;color:#999;text-transform:uppercase;font-weight:700}'
    + '.cell-value{font-size:15px;font-weight:700;margin-top:4px}'
    + '.section{font-size:12px;font-weight:700;color:#e63946;text-transform:uppercase;margin:16px 0 8px;padding-left:8px;border-left:3px solid #e63946}'
    + '.problem{background:#fff8f8;border:1px solid #ffd0d0;border-radius:8px;padding:12px;font-size:14px;line-height:1.7}'
    + '.photos{display:grid;grid-template-columns:1fr 1fr;gap:14px}'
    + '.photo-card{border:1px solid #e8e8e8;border-radius:8px;overflow:hidden}'
    + '.photo-label{background:#1a1a2e;color:#fff;text-align:center;font-size:11px;font-weight:700;padding:6px}'
    + '.no-photo{height:150px;display:flex;align-items:center;justify-content:center;color:#ccc;background:#fafafa}'
    + '.footer{margin-top:24px;padding-top:12px;border-top:1px solid #e8e8e8;display:flex;justify-content:space-between}'
    + '.sign{border-top:1px solid #999;width:150px;text-align:center;padding-top:6px;font-size:12px;color:#555}'
    + '</style></head><body>'
    + '<div class="header"><div class="logo">SEK_VB</div>'
    + '<div style="text-align:right"><b style="font-size:17px">Inspection Report</b><br/>'
    + '<span style="font-size:12px;color:#888">Report #' + record.id + '</span></div></div>'
    + '<div class="grid">'
    + '<div class="cell"><div class="cell-label">Inspector</div><div class="cell-value">' + user.name + '</div></div>'
    + '<div class="cell"><div class="cell-label">Role</div><div class="cell-value">' + user.role + '</div></div>'
    + '<div class="cell"><div class="cell-label">Vehicle Number</div><div class="cell-value" style="color:#e63946">' + record.vehicleNo + '</div></div>'
    + '<div class="cell"><div class="cell-label">Owner Name</div><div class="cell-value">' + record.ownerName + '</div></div>'
    + '<div class="cell"><div class="cell-label">Vehicle Type</div><div class="cell-value">' + record.vehicleType + '</div></div>'
    + '<div class="cell"><div class="cell-label">Date &amp; Time</div><div class="cell-value">' + record.datetime + '</div></div>'
    + (record.supervisor ? '<div class="cell"><div class="cell-label">Supervisor</div><div class="cell-value">' + record.supervisor + '</div></div>' : '')
    + (record.technician ? '<div class="cell"><div class="cell-label">Technician</div><div class="cell-value">' + record.technician + '</div></div>' : '')
    + '</div>'
    + '<div class="section">Vehicle Problem</div>'
    + '<div class="problem">' + record.problem + '</div>'
    + '<div class="section">Before &amp; After Photos</div>'
    + '<div class="photos">'
    + '<div class="photo-card"><div class="photo-label">Before</div>' + beforeImg + '</div>'
    + '<div class="photo-card"><div class="photo-label">After</div>' + afterImg + '</div>'
    + '</div>'
    + '<div class="footer">'
    + '<div class="sign">' + user.name + '<br/>Inspector Signature</div>'
    + '<div style="font-size:11px;color:#aaa;text-align:right">Generated by SEK_VB<br/>' + new Date().toLocaleString('en-IN') + '</div>'
    + '</div></body></html>';
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user,         setUser]         = useState(null);
  const [record,       setRecord]       = useState(null);
  const [complaints,   setComplaints]   = useState([]);
  const [settings,     setSettings]     = useState(DEFAULT_SETTINGS);
  const [savedReports, setSavedReports] = useState([]);
  const [screen,       setScreen]       = useState('main'); // 'main' | 'savedReports' | 'viewSavedReport'
  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => {
    loadComplaints().then(setComplaints);
    loadSettings().then(setSettings);
    loadSavedReports().then(setSavedReports);
  }, []);

  async function handleSettingsChange(newSettings) {
    setSettings(newSettings);
    await saveSettings(newSettings);
  }

  async function handleReport(newRecord) {
    const updated = await saveComplaints([...complaints, newRecord]);
    setComplaints(updated);
    setRecord(newRecord);
  }

  async function handleSaveReport(rec, usr) {
    const entry = { ...rec, savedAt: new Date().toISOString(), savedBy: usr.name, savedByRole: usr.role };
    const updated = await saveSavedReports([...savedReports, entry]);
    setSavedReports(updated);
    return updated.length;
  }

  async function handleDeleteSavedReport(id) {
    // Remove first occurrence of this report id
    let removed = false;
    const updated = savedReports.filter(r => {
      if (!removed && r.id === id) { removed = true; return false; }
      return true;
    });
    const final = await saveSavedReports(updated);
    setSavedReports(final);
  }

  async function handleComplaintAction(id, action) {
    if (action === 'delete') {
      Alert.alert('Delete', T[settings.lang].deleteComplaintQ, [
        { text: T[settings.lang].cancel, style: 'cancel' },
        { text: T[settings.lang].delete, style: 'destructive', onPress: async () => {
          const updated = complaints.filter(c => c.id !== id);
          setComplaints(await saveComplaints(updated));
        }},
      ]);
      return;
    }
    const statusMap = { 'Complete': 'Complete', 'Re-open': 'Re-opened' };
    const updated = complaints.map(c => c.id === id ? { ...c, status: statusMap[action] || action } : c);
    setComplaints(await saveComplaints(updated));
  }

  if (!user) return <LoginScreen onLogin={setUser} settings={settings}/>;

  if (user.role === 'Admin') {
    return <AdminScreen
      user={user} onLogout={() => setUser(null)}
      complaints={complaints} onComplaintAction={handleComplaintAction}
      settings={settings} onSettingsChange={handleSettingsChange}
      savedReports={savedReports} onDeleteSavedReport={handleDeleteSavedReport}
    />;
  }

  if (user.role === 'Manager' || user.role === 'Technician') {
    return <StaffScreen
      user={user} onLogout={() => setUser(null)}
      complaints={complaints} onComplaintAction={handleComplaintAction}
      settings={settings}
    />;
  }

  // Saved Reports screen (all roles)
  if (screen === 'savedReports') return <SavedReportsScreen
    user={user} savedReports={savedReports} settings={settings}
    onBack={() => setScreen('main')}
    onDeleteReport={handleDeleteSavedReport}
    onViewReport={(rep) => { setViewingReport(rep); setScreen('viewSavedReport'); }}
  />;

  if (screen === 'viewSavedReport' && viewingReport) return <ReportScreen
    user={user} record={viewingReport} settings={settings}
    onBack={() => { setViewingReport(null); setScreen('savedReports'); }}
    onNew={() => { setViewingReport(null); setScreen('main'); setRecord(null); }}
    onSaveReport={null}
    savedReports={savedReports}
    isViewMode={true}
  />;

  // Inspector flow
  if (record) return <ReportScreen
    user={user} record={record} settings={settings}
    onBack={() => setRecord(null)} onNew={() => setRecord(null)}
    onSaveReport={handleSaveReport}
    savedReports={savedReports}
    onOpenSavedReports={() => setScreen('savedReports')}
  />;

  return <InspectionScreen
    user={user} onLogout={() => setUser(null)}
    onReport={handleReport} complaints={complaints}
    settings={settings}
    onOpenSavedReports={() => setScreen('savedReports')}
    savedReportsCount={savedReports.length}
  />;
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  card:         { borderRadius:14, padding:16, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8, elevation:3, marginBottom:4 },
  cardTitle:    { fontSize:20, fontWeight:'700', marginBottom:18, textAlign:'center' },
  label:        { fontSize:11, fontWeight:'700', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6, marginTop:4 },
  input:        { borderWidth:1.5, borderRadius:10, padding:12, fontSize:14, marginBottom:4 },
  btn:          { backgroundColor:'#e63946', borderRadius:12, padding:15, alignItems:'center',
                  shadowColor:'#e63946', shadowOpacity:0.3, shadowRadius:8, elevation:4 },
  btnText:      { color:'#fff', fontSize:15, fontWeight:'800' },
  smallBtn:     { flex:1, borderRadius:8, padding:8, alignItems:'center' },
  smallBtnText: { color:'#fff', fontSize:12, fontWeight:'700' },
  header:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16 },
  headerTitle:  { color:'#fff', fontWeight:'800', fontSize:17 },
  headerSub:    { color:'#8888aa', fontSize:11 },
  logoutBtn:    { backgroundColor:'rgba(255,255,255,0.12)', borderRadius:8,
                  paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:'rgba(255,255,255,0.2)' },
  logoutText:   { color:'#fff', fontSize:13, fontWeight:'600' },
  sectionTitle: { fontSize:12, fontWeight:'700', color:'#e63946', textTransform:'uppercase',
                  letterSpacing:0.8, marginBottom:12, paddingLeft:10, borderLeftWidth:3, borderLeftColor:'#e63946' },
  chip:         { borderWidth:1.5, borderColor:'#e0e0e0', borderRadius:20,
                  paddingHorizontal:14, paddingVertical:7, marginRight:8, marginVertical:4 },
  chipActive:   { backgroundColor:'#e63946', borderColor:'#e63946' },
  chipText:     { fontSize:13, color:'#555', fontWeight:'600' },
  photoBox:     { borderWidth:2, borderStyle:'dashed', borderRadius:10, height:130, overflow:'hidden' },
  photoImg:     { width:'100%', height:'100%', resizeMode:'cover' },
  photoPlaceholder: { flex:1, alignItems:'center', justifyContent:'center' },
  tab:          { flex:1, paddingVertical:7, alignItems:'center', borderRadius:8 },
  tabActive:    { backgroundColor:'#e63946' },
  tabText:      { fontSize:10, color:'#8888aa', fontWeight:'600' },
  tabTextActive:{ color:'#fff' },
  statCard:     { borderRadius:12, padding:12, alignItems:'center' },
  statNum:      { fontSize:26, fontWeight:'800', color:'#fff' },
  statLabel:    { fontSize:10, color:'rgba(255,255,255,0.7)', marginTop:2, fontWeight:'600' },
  progressBg:   { height:10, backgroundColor:'#f0f0f0', borderRadius:5, overflow:'hidden' },
  progressFill: { height:10, backgroundColor:'#2a9d8f', borderRadius:5 },
  badge:        { paddingHorizontal:8, paddingVertical:3, borderRadius:20 },
  complaintRow: { flexDirection:'row', alignItems:'center', paddingVertical:8, borderBottomWidth:1 },
  avatarCircle: { width:44, height:44, borderRadius:22, alignItems:'center', justifyContent:'center' },
});
