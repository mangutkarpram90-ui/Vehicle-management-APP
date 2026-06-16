import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert, ActivityIndicator, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const USERS = [
  { id: 1, name: 'Rahul Patil',  email: 'rahul@workshop.com',  password: '1234', role: 'Inspector' },
  { id: 2, name: 'Suresh Desai', email: 'suresh@workshop.com', password: '1234', role: 'Manager' },
  { id: 3, name: 'Amit Shinde',  email: 'amit@workshop.com',   password: '1234', role: 'Technician' },
];

const VEHICLE_TYPES = ['Car','Bike','Truck','Auto','Bus','Tractor','Other'];

function getNow() {
  return new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

// ── LOGIN ──────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');

  function handleLogin() {
    const user = USERS.find(u => u.email === email.trim() && u.password === pass);
    if (user) onLogin(user);
    else Alert.alert('Login Failed', 'चुकीचा Email किंवा Password!');
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.loginScroll}>
        <View style={s.logoBox}>
          <Text style={s.logoIcon}>🚗</Text>
          <Text style={s.logoTitle}>AutoInspect</Text>
          <Text style={s.logoSub}>Vehicle Inspection System</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>Login करा</Text>
          <Text style={s.label}>Email</Text>
          <TextInput style={s.input} placeholder="Email टाका" placeholderTextColor="#aaa"
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
          <Text style={s.label}>Password</Text>
          <TextInput style={s.input} placeholder="Password टाका" placeholderTextColor="#aaa"
            value={pass} onChangeText={setPass} secureTextEntry/>
          <TouchableOpacity style={s.btn} onPress={handleLogin}>
            <Text style={s.btnText}>Login करा →</Text>
          </TouchableOpacity>
          <View style={s.demo}>
            <Text style={s.demoTitle}>Demo Accounts (password: 1234)</Text>
            {USERS.map(u => (
              <TouchableOpacity key={u.id} onPress={() => { setEmail(u.email); setPass('1234'); }}>
                <Text style={s.demoItem}>👤 {u.name} — {u.email}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── INSPECTION FORM ────────────────────────────────────────────────────────────
function InspectionScreen({ user, onLogout, onReport }) {
  const [vehicleNo,   setVehicleNo]   = useState('');
  const [ownerName,   setOwnerName]   = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [problem,     setProblem]     = useState('');
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto,  setAfterPhoto]  = useState(null);

  async function pickPhoto(type) {
    Alert.alert(`${type === 'before' ? 'Before' : 'After'} Photo`, 'Photo', [
      { text: 'Camera',  onPress: () => openSource(type, 'camera')  },
      { text: 'Gallery', onPress: () => openSource(type, 'gallery') },
      { text: 'Cancel',  style: 'cancel' },
    ]);
  }

  async function openSource(type, source) {
    let res;
    const opts = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6, base64: true };
    if (source === 'camera') {
      const p = await ImagePicker.requestCameraPermissionsAsync();
      if (!p.granted) { Alert.alert('Permission नाही', 'Settings मध्ये Camera allow करा.'); return; }
      res = await ImagePicker.launchCameraAsync(opts);
    } else {
      const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!p.granted) { Alert.alert('Permission नाही', 'Settings मध्ये Gallery allow करा.'); return; }
      res = await ImagePicker.launchImageLibraryAsync(opts);
    }
    if (!res.canceled) {
      const obj = { uri: res.assets[0].uri, b64: `data:image/jpeg;base64,${res.assets[0].base64}` };
      type === 'before' ? setBeforePhoto(obj) : setAfterPhoto(obj);
    }
  }

  function handleNext() {
    if (!vehicleNo.trim()) { Alert.alert('Error', 'Vehicle Number भरा!'); return; }
    if (!ownerName.trim()) { Alert.alert('Error', 'Owner Name भरा!');   return; }
    if (!problem.trim())   { Alert.alert('Error', 'Problem लिहा!');      return; }
    onReport({
      id: Date.now().toString().slice(-6),
      vehicleNo: vehicleNo.toUpperCase(),
      ownerName, vehicleType, problem,
      beforePhoto: beforePhoto?.b64 || null,
      afterPhoto:  afterPhoto?.b64  || null,
      datetime: getNow(),
    });
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
          <Text style={{ fontSize:22 }}>🚗</Text>
          <View>
            <Text style={s.headerTitle}>AutoInspect</Text>
            <Text style={s.headerSub}>नवीन Inspection</Text>
          </View>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex:1, padding:14 }} showsVerticalScrollIndicator={false}>
        {/* User info */}
        <View style={[s.card, { flexDirection:'row', justifyContent:'space-between', marginBottom:12 }]}>
          <View>
            <Text style={s.label}>Inspector</Text>
            <Text style={{ fontWeight:'700', fontSize:15, color:'#1a1a2e' }}>{user.name}</Text>
          </View>
          <View style={{ alignItems:'flex-end' }}>
            <Text style={s.label}>Date & Time</Text>
            <Text style={{ fontWeight:'700', fontSize:13, color:'#e63946' }}>{getNow()}</Text>
          </View>
        </View>

        {/* Vehicle details */}
        <View style={[s.card, { marginBottom:12 }]}>
          <Text style={s.sectionTitle}>🚘 Vehicle Details</Text>
          <Text style={s.label}>Vehicle Number *</Text>
          <TextInput style={s.input} placeholder="MH12 AB 1234" placeholderTextColor="#bbb"
            value={vehicleNo} onChangeText={t => setVehicleNo(t.toUpperCase())} autoCapitalize="characters"/>
          <Text style={s.label}>Owner Name *</Text>
          <TextInput style={s.input} placeholder="मालकाचे नाव" placeholderTextColor="#bbb"
            value={ownerName} onChangeText={setOwnerName}/>
          <Text style={s.label}>Vehicle Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {VEHICLE_TYPES.map(t => (
              <TouchableOpacity key={t} style={[s.chip, vehicleType===t && s.chipActive]}
                onPress={() => setVehicleType(t)}>
                <Text style={[s.chipText, vehicleType===t && { color:'#fff' }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Problem */}
        <View style={[s.card, { marginBottom:12 }]}>
          <Text style={s.sectionTitle}>🔧 Vehicle Problem *</Text>
          <TextInput style={[s.input, { height:100, textAlignVertical:'top' }]}
            placeholder="Problem इथे लिहा..." placeholderTextColor="#bbb"
            value={problem} onChangeText={setProblem} multiline/>
        </View>

        {/* Photos */}
        <View style={[s.card, { marginBottom:12 }]}>
          <Text style={s.sectionTitle}>📸 Before & After Photos</Text>
          <View style={{ flexDirection:'row', gap:12 }}>
            {[{type:'before',photo:beforePhoto,set:setBeforePhoto},
              {type:'after', photo:afterPhoto, set:setAfterPhoto}].map(({ type, photo, set }) => (
              <View key={type} style={{ flex:1 }}>
                <Text style={[s.label, { marginBottom:6 }]}>{type==='before'?'🔴':'🟢'} {type==='before'?'Before':'After'}</Text>
                <TouchableOpacity style={s.photoBox} onPress={() => pickPhoto(type)}>
                  {photo
                    ? <Image source={{ uri: photo.uri }} style={s.photoImg}/>
                    : <View style={s.photoPlaceholder}>
                        <Text style={{ fontSize:28 }}>📷</Text>
                        <Text style={{ fontSize:12, color:'#aaa', marginTop:4 }}>Upload करा</Text>
                      </View>}
                </TouchableOpacity>
                {photo && (
                  <TouchableOpacity onPress={() => set(null)}>
                    <Text style={{ color:'#e63946', fontSize:12, textAlign:'center', marginTop:4 }}>✕ Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={s.btn} onPress={handleNext}>
          <Text style={s.btnText}>📄 Report Generate करा →</Text>
        </TouchableOpacity>
        <View style={{ height:30 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── REPORT ─────────────────────────────────────────────────────────────────────
function ReportScreen({ user, record, onBack, onNew }) {
  const [loading, setLoading] = useState(false);

  async function exportPDF() {
    setLoading(true);
    try {
      const html = buildHTML(record, user);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType:'application/pdf', dialogTitle:'Report Share करा' });
    } catch(e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }

  async function printDirect() {
    try { await Print.printAsync({ html: buildHTML(record, user) }); }
    catch(e) { Alert.alert('Error', e.message); }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}><Text style={{ color:'#fff', fontSize:15 }}>← मागे</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Report Preview</Text>
        <View style={{ width:50 }}/>
      </View>
      <ScrollView style={{ flex:1, padding:14 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor:'#d4edda', borderRadius:20, alignSelf:'flex-start',
          paddingHorizontal:14, paddingVertical:6, marginBottom:14 }}>
          <Text style={{ color:'#155724', fontWeight:'700' }}>✓ Report #{record.id}</Text>
        </View>

        <View style={[s.card, { marginBottom:12 }]}>
          <Text style={s.sectionTitle}>👤 Inspector</Text>
          <Row label="Name"      value={user.name} />
          <Row label="Role"      value={user.role} />
          <Row label="Date/Time" value={record.datetime} highlight />
        </View>

        <View style={[s.card, { marginBottom:12 }]}>
          <Text style={s.sectionTitle}>🚘 Vehicle</Text>
          <Row label="Vehicle No"  value={record.vehicleNo}   highlight />
          <Row label="Owner"       value={record.ownerName} />
          <Row label="Type"        value={record.vehicleType} />
        </View>

        <View style={[s.card, { marginBottom:12 }]}>
          <Text style={s.sectionTitle}>🔧 Problem</Text>
          <Text style={{ fontSize:14, color:'#333', lineHeight:22 }}>{record.problem}</Text>
        </View>

        <View style={[s.card, { marginBottom:16 }]}>
          <Text style={s.sectionTitle}>📸 Photos</Text>
          <View style={{ flexDirection:'row', gap:10 }}>
            {[{label:'🔴 Before', photo:record.beforePhoto},
              {label:'🟢 After',  photo:record.afterPhoto}].map(({ label, photo }) => (
              <View key={label} style={{ flex:1 }}>
                <Text style={[s.label,{marginBottom:6}]}>{label}</Text>
                {photo
                  ? <Image source={{ uri:photo }} style={{ width:'100%', height:120, borderRadius:8, resizeMode:'cover' }}/>
                  : <View style={{ height:80, backgroundColor:'#f8f9fa', borderRadius:8,
                      alignItems:'center', justifyContent:'center' }}>
                      <Text style={{ color:'#ccc', fontSize:12 }}>No Photo</Text>
                    </View>}
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={s.btn} onPress={exportPDF} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff"/> : <Text style={s.btnText}>📄 PDF Save / Share करा</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, { backgroundColor:'#1a1a2e', marginTop:10 }]} onPress={printDirect}>
          <Text style={s.btnText}>🖨️ Print करा</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, { backgroundColor:'#fff', borderWidth:2,
          borderColor:'#e63946', marginTop:10 }]} onPress={onNew}>
          <Text style={[s.btnText, { color:'#e63946' }]}>+ नवीन Inspection</Text>
        </TouchableOpacity>
        <View style={{ height:30 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, highlight }) {
  return (
    <View style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:8,
      borderBottomWidth:1, borderBottomColor:'#f0f0f0' }}>
      <Text style={{ fontSize:13, color:'#888' }}>{label}</Text>
      <Text style={{ fontSize:14, fontWeight:'700', color: highlight ? '#e63946' : '#1a1a2e' }}>{value}</Text>
    </View>
  );
}

function buildHTML(record, user) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  body{font-family:Arial,sans-serif;padding:30px;color:#1a1a2e}
  .header{display:flex;justify-content:space-between;border-bottom:3px solid #e63946;padding-bottom:12px;margin-bottom:18px}
  .logo{font-size:22px;font-weight:800;color:#e63946}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
  .cell{background:#f8f9fa;border-radius:8px;padding:12px}
  .cell-label{font-size:10px;color:#999;text-transform:uppercase;font-weight:700}
  .cell-value{font-size:15px;font-weight:700;margin-top:4px}
  .section{font-size:12px;font-weight:700;color:#e63946;text-transform:uppercase;
    margin:16px 0 8px;padding-left:8px;border-left:3px solid #e63946}
  .problem{background:#fff8f8;border:1px solid #ffd0d0;border-radius:8px;padding:12px;font-size:14px;line-height:1.7}
  .photos{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .photo-card{border:1px solid #e8e8e8;border-radius:8px;overflow:hidden}
  .photo-label{background:#1a1a2e;color:#fff;text-align:center;font-size:11px;font-weight:700;padding:6px}
  .photo-card img{width:100%;height:200px;object-fit:cover;display:block}
  .no-photo{height:150px;display:flex;align-items:center;justify-content:center;color:#ccc;background:#fafafa}
  .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e8e8e8;display:flex;justify-content:space-between}
  .sign{border-top:1px solid #999;width:150px;text-align:center;padding-top:6px;font-size:12px;color:#555}
</style></head><body>
<div class="header">
  <div class="logo">🚗 AutoInspect</div>
  <div style="text-align:right"><b style="font-size:17px">Inspection Report</b><br/><span style="font-size:12px;color:#888">Report #${record.id}</span></div>
</div>
<div class="grid">
  <div class="cell"><div class="cell-label">Inspector</div><div class="cell-value">${user.name}</div></div>
  <div class="cell"><div class="cell-label">Role</div><div class="cell-value">${user.role}</div></div>
  <div class="cell"><div class="cell-label">Vehicle Number</div><div class="cell-value" style="color:#e63946">${record.vehicleNo}</div></div>
  <div class="cell"><div class="cell-label">Owner Name</div><div class="cell-value">${record.ownerName}</div></div>
  <div class="cell"><div class="cell-label">Vehicle Type</div><div class="cell-value">${record.vehicleType}</div></div>
  <div class="cell"><div class="cell-label">Date & Time</div><div class="cell-value">${record.datetime}</div></div>
</div>
<div class="section">Vehicle Problem</div>
<div class="problem">${record.problem}</div>
<div class="section">Before & After Photos</div>
<div class="photos">
  <div class="photo-card"><div class="photo-label">📷 Before</div>${record.beforePhoto?`<img src="${record.beforePhoto}"/>`:' <div class="no-photo">No Photo</div>'}</div>
  <div class="photo-card"><div class="photo-label">📷 After</div>${record.afterPhoto?`<img src="${record.afterPhoto}"/>`:' <div class="no-photo">No Photo</div>'}</div>
</div>
<div class="footer">
  <div class="sign">${user.name}<br/>Inspector Signature</div>
  <div style="font-size:11px;color:#aaa;text-align:right">Generated by AutoInspect<br/>${new Date().toLocaleString('en-IN')}</div>
</div>
</body></html>`;
}

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,   setUser]   = useState(null);
  const [record, setRecord] = useState(null);

  if (!user)   return <LoginScreen onLogin={setUser}/>;
  if (record)  return <ReportScreen user={user} record={record}
                        onBack={() => setRecord(null)}
                        onNew={() => setRecord(null)}/>
  return <InspectionScreen user={user} onLogout={() => setUser(null)} onReport={setRecord}/>;
}

// ── STYLES ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:        { flex:1, backgroundColor:'#1a1a2e' },
  loginScroll: { flexGrow:1, justifyContent:'center', padding:20, backgroundColor:'#1a1a2e' },
  logoBox:     { alignItems:'center', marginBottom:28 },
  logoIcon:    { fontSize:52, marginBottom:8 },
  logoTitle:   { fontSize:28, fontWeight:'800', color:'#fff' },
  logoSub:     { fontSize:14, color:'#8888aa', marginTop:4 },
  card:        { backgroundColor:'#fff', borderRadius:14, padding:18,
                 shadowColor:'#000', shadowOpacity:0.07, shadowRadius:8, elevation:3 },
  cardTitle:   { fontSize:20, fontWeight:'700', color:'#1a1a2e', marginBottom:18, textAlign:'center' },
  label:       { fontSize:11, fontWeight:'700', color:'#555', textTransform:'uppercase',
                 letterSpacing:0.5, marginBottom:6, marginTop:4 },
  input:       { borderWidth:1.5, borderColor:'#e8e8e8', borderRadius:10, padding:12,
                 fontSize:14, color:'#1a1a2e', marginBottom:4, backgroundColor:'#fafafa' },
  btn:         { backgroundColor:'#e63946', borderRadius:12, padding:15, alignItems:'center',
                 shadowColor:'#e63946', shadowOpacity:0.3, shadowRadius:8, elevation:4 },
  btnText:     { color:'#fff', fontSize:15, fontWeight:'800' },
  demo:        { marginTop:18, backgroundColor:'#f8f9fa', borderRadius:10, padding:14 },
  demoTitle:   { fontSize:12, fontWeight:'700', color:'#555', marginBottom:8 },
  demoItem:    { fontSize:13, color:'#e63946', marginBottom:5, fontWeight:'500' },
  header:      { backgroundColor:'#1a1a2e', flexDirection:'row', alignItems:'center',
                 justifyContent:'space-between', padding:16 },
  headerTitle: { color:'#fff', fontWeight:'800', fontSize:17 },
  headerSub:   { color:'#8888aa', fontSize:11 },
  logoutBtn:   { backgroundColor:'rgba(255,255,255,0.12)', borderRadius:8,
                 paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderColor:'rgba(255,255,255,0.2)' },
  logoutText:  { color:'#fff', fontSize:13, fontWeight:'600' },
  sectionTitle:{ fontSize:12, fontWeight:'700', color:'#e63946', textTransform:'uppercase',
                 letterSpacing:0.8, marginBottom:12, paddingLeft:10, borderLeftWidth:3, borderLeftColor:'#e63946' },
  chip:        { borderWidth:1.5, borderColor:'#e0e0e0', borderRadius:20,
                 paddingHorizontal:14, paddingVertical:7, marginRight:8, marginVertical:4 },
  chipActive:  { backgroundColor:'#e63946', borderColor:'#e63946' },
  chipText:    { fontSize:13, color:'#555', fontWeight:'600' },
  photoBox:    { borderWidth:2, borderColor:'#e0e0e0', borderStyle:'dashed', borderRadius:10, height:130, overflow:'hidden' },
  photoImg:    { width:'100%', height:'100%', resizeMode:'cover' },
  photoPlaceholder: { flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#fafafa' },
});