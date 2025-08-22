"use client";

import { useState, useEffect } from "react";
import { supabase, uploadImage } from "../../lib/supabase";
import Navigation from "../components/Navigation";
import ImageUpload from "../components/ImageUpload";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

// Expose Supabase in browser for quick diagnostics and enable lightweight timing logs
if (typeof window !== 'undefined') {
  // @ts-ignore
  (window as any).sb = supabase;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string | null;
  order_index: number;
}

interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  is_active: boolean;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  project_url: string | null;
  category: string;
  technologies: string[];
  is_featured: boolean;
  order_index: number;
}

interface Client {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  is_featured: boolean;
  order_index: number;
}

export default function AdminPanel() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState<'team' | 'careers' | 'portfolio' | 'clients'>('team');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const isDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');
    const safetyTimer = setTimeout(() => {
      // Ensure UI never gets stuck on "Checking session..."
      if (isDebug) {
        // eslint-disable-next-line no-console
        console.log('[admin] safety timeout fired; unblocking UI');
      }
      setSessionChecked(true);
    }, 1800);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authed = Boolean(session?.user?.id);
      setIsAuthenticated(authed);
      if (authed) {
        const start = performance.now();
        const { data } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', session!.user!.id)
          .maybeSingle();
        if (isDebug) {
          // eslint-disable-next-line no-console
          console.log('[admin] admin_users check (auth listener) ms =', Math.round(performance.now() - start));
        }
        setIsAdmin(Boolean(data));
        if (data) {
          void fetchData();
        }
      } else {
        setIsAdmin(false);
      }
      setSessionChecked(true);
      clearTimeout(safetyTimer);
    });

    const t0 = performance.now();
    supabase.auth.getSession()
    .then(({ data }) => {
      const session = data.session;
      const authed = Boolean(session?.user?.id);
      setIsAuthenticated(authed);
      // Unblock the UI immediately after we know auth state
      setSessionChecked(true);
      clearTimeout(safetyTimer);
      if (isDebug) {
        // eslint-disable-next-line no-console
        console.log('[admin] getSession ms =', Math.round(performance.now() - t0));
      }
      if (authed) {
        const userId = session!.user!.id;
        const t1 = performance.now();
        supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle()
          .then(({ data: adminRow }) => {
            if (isDebug) {
              // eslint-disable-next-line no-console
              console.log('[admin] admin_users check ms =', Math.round(performance.now() - t1));
            }
            setIsAdmin(Boolean(adminRow));
            if (adminRow) {
              void fetchData();
            }
          });
      } else {
        setIsAdmin(false);
      }
    })
    .catch((err) => {
      if (isDebug) {
        // eslint-disable-next-line no-console
        console.log('[admin] getSession error', err);
      }
      setSessionChecked(true);
      clearTimeout(safetyTimer);
    });

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  async function fetchData() {
    const [teamRes, careersRes, portfolioRes, clientsRes] = await Promise.all([
      supabase.from('team_members').select('*').order('order_index'),
      supabase.from('careers').select('*').order('created_at', { ascending: false }),
      supabase.from('portfolio_items').select('*').order('order_index'),
      supabase.from('clients').select('*').order('order_index')
    ]);
    if (teamRes.data) setTeamMembers(teamRes.data);
    if (careersRes.data) setCareers(careersRes.data);
    if (portfolioRes.data) setPortfolioItems(portfolioRes.data);
    if (clientsRes.data) setClients(clientsRes.data);
  }

  const tabs = [
    { id: 'team' as const, label: 'Team Members' },
    { id: 'careers' as const, label: 'Careers' },
    { id: 'portfolio' as const, label: 'Portfolio' },
    { id: 'clients' as const, label: 'Clients' }
  ];

  if (!sessionChecked) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: "#509887" }}></div>
            <p style={{ color: "#8C8D8D" }}>Checking session...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (!isAdmin) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4" style={{ color: "#E7E7E7" }}>Not authorized</h1>
            <p className="mb-6" style={{ color: "#8C8D8D" }}>Your account does not have admin access.</p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-6 py-3 rounded-lg font-semibold"
              style={{ backgroundColor: "#509887", color: "#090A0A" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      
      <div className="font-sans min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold" style={{ color: "#E7E7E7" }}>
              Admin Panel
            </h1>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 rounded-lg font-semibold"
              style={{ backgroundColor: "#1A1B1B", color: "#E7E7E7", border: "1px solid #2A2B2B" }}
            >
              Sign out
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8 border-b" style={{ borderColor: "#1A1B1B" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
                  activeTab === tab.id ? '' : 'hover:scale-105'
                }`}
                style={{
                  color: activeTab === tab.id ? "#509887" : "#8C8D8D",
                  borderBottomColor: activeTab === tab.id ? "#509887" : "transparent"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-96">
            {activeTab === 'team' && (
              <TeamManagement 
                teamMembers={teamMembers}
                onRefresh={fetchData}
              />
            )}
            {activeTab === 'careers' && (
              <CareersManagement 
                careers={careers}
                onRefresh={fetchData}
              />
            )}
            {activeTab === 'portfolio' && (
              <PortfolioManagement 
                portfolioItems={portfolioItems}
                onRefresh={fetchData}
              />
            )}
            {activeTab === 'clients' && (
              <ClientsManagement 
                clients={clients}
                onRefresh={fetchData}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.href : undefined } });
        if (error) throw error;
        setMessage('Check your email for the sign-in link.');
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Account created. If email confirmation is enabled, check your inbox.');
      }
    } catch (err: any) {
      setMessage(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen pt-24 flex items-center justify-center px-6">
        <div className="w-full max-w-md p-6 rounded-2xl border" style={{ backgroundColor: "#0C0D0D", borderColor: "#1A1B1B" }}>
          <h1 className="text-2xl font-semibold mb-4" style={{ color: "#E7E7E7" }}>Admin Sign In</h1>
          <p className="mb-6 text-sm" style={{ color: "#8C8D8D" }}>
            Sign in to manage content. Only allowlisted accounts can make changes.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/40 outline-none"
              style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
            />
            {mode !== 'magic' && (
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{ backgroundColor: "#509887", color: "#090A0A", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Please wait…' : mode === 'magic' ? 'Send Magic Link' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          {message && (<p className="mt-4 text-sm" style={{ color: "#8C8D8D" }}>{message}</p>)}
          <div className="mt-6 text-sm" style={{ color: "#8C8D8D" }}>
            <button onClick={() => setMode(mode === 'magic' ? 'signin' : 'magic')} className="underline mr-4">{mode === 'magic' ? 'Use password' : 'Use magic link'}</button>
            {mode !== 'magic' && (
              <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="underline">
                {mode === 'signin' ? 'Create admin account' : 'Back to sign in'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function TeamManagement({ teamMembers, onRefresh }: { teamMembers: TeamMember[], onRefresh: () => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    image_url: "",
    order_index: 0
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (editingId) {
      await supabase
        .from('team_members')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('team_members')
        .insert([formData]);
    }
    
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ name: "", role: "", bio: "", image_url: "", order_index: 0 });
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this team member?')) {
      await supabase.from('team_members').delete().eq('id', id);
      onRefresh();
    }
  }

  function startEdit(member: TeamMember) {
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image_url: member.image_url || "",
      order_index: member.order_index
    });
    setEditingId(member.id);
    setShowAddForm(true);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: "#E7E7E7" }}>Team Members</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: "#509887", color: "#090A0A" }}
        >
          <Plus size={20} />
          Add Member
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 rounded-xl border" style={{ backgroundColor: "#0C0D0D", borderColor: "#1A1B1B" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold" style={{ color: "#E7E7E7" }}>
              {editingId ? 'Edit' : 'Add'} Team Member
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({ name: "", role: "", bio: "", image_url: "", order_index: 0 });
              }}
              style={{ color: "#8C8D8D" }}
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
              <input
                required
                type="text"
                placeholder="Role/Position"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#E7E7E7" }}>
                Profile Image
              </label>
              <ImageUpload
                value={formData.image_url}
                onChange={(imageUrl) => setFormData({ ...formData, image_url: imageUrl })}
                onUpload={async (file, croppedImageUrl) => {
                  // Convert cropped blob URL to File for upload
                  const response = await fetch(croppedImageUrl);
                  const blob = await response.blob();
                  const croppedFile = new File([blob], file.name, { type: file.type });
                  return await uploadImage(croppedFile, 'team');
                }}
                aspectRatio={1}
              />
            </div>
            
            <textarea
              required
              rows={4}
              placeholder="Bio/Description"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-black/40 outline-none resize-y"
              style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
            />
            
            <input
              type="number"
              placeholder="Order Index"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              className="w-32 px-4 py-3 rounded-lg bg-black/40 outline-none"
              style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
            />
            
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: "#509887", color: "#090A0A" }}
            >
              <Save size={20} />
              {editingId ? 'Update' : 'Add'} Member
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div 
            key={member.id}
            className="p-6 rounded-xl border"
            style={{ backgroundColor: "#0C0D0D", borderColor: "#1A1B1B" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "#E7E7E7" }}>{member.name}</h3>
                <p style={{ color: "#509887" }}>{member.role}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(member)}
                  className="p-2 rounded hover:bg-white/10 transition-colors"
                  style={{ color: "#8C8D8D" }}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-2 rounded hover:bg-red-900/20 transition-colors"
                  style={{ color: "#EF4444" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm" style={{ color: "#8C8D8D" }}>{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CareersManagement({ careers, onRefresh }: { careers: Career[], onRefresh: () => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    description: "",
    requirementsText: "",
    is_active: true as boolean,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const requirements = formData.requirementsText
      .split(/\r?\n|,/)
      .map(s => s.trim())
      .filter(Boolean);
    if (editingId) {
      await supabase
        .from('careers')
        .update({
          title: formData.title,
          department: formData.department,
          location: formData.location,
          type: formData.type,
          description: formData.description,
          requirements,
          is_active: formData.is_active,
        })
        .eq('id', editingId);
    } else {
      await supabase
        .from('careers')
        .insert([{ 
          title: formData.title,
          department: formData.department,
          location: formData.location,
          type: formData.type,
          description: formData.description,
          requirements,
          is_active: formData.is_active,
        }]);
    }
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ title: "", department: "", location: "", type: "Full-time", description: "", requirementsText: "", is_active: true });
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this position?')) {
      await supabase.from('careers').delete().eq('id', id);
      onRefresh();
    }
  }

  function startEdit(career: Career) {
    setFormData({
      title: career.title,
      department: career.department,
      location: career.location,
      type: career.type,
      description: career.description,
      requirementsText: (career.requirements || []).join('\n'),
      is_active: career.is_active,
    });
    setEditingId(career.id);
    setShowAddForm(true);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: "#E7E7E7" }}>Career Positions</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: "#509887", color: "#090A0A" }}
        >
          <Plus size={20} />
          Add Position
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 rounded-xl border" style={{ backgroundColor: "#0C0D0D", borderColor: "#1A1B1B" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold" style={{ color: "#E7E7E7" }}>
              {editingId ? 'Edit' : 'Add'} Position
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({ title: "", department: "", location: "", type: "Full-time", description: "", requirementsText: "", is_active: true });
              }}
              style={{ color: "#8C8D8D" }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                type="text"
                placeholder="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
              <input
                required
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
              <input
                required
                type="text"
                placeholder="Type (Full-time, Part-time, Contract)"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
            </div>
            <textarea
              required
              rows={4}
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-black/40 outline-none resize-y"
              style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
            />
            <textarea
              rows={4}
              placeholder="Requirements (one per line or comma-separated)"
              value={formData.requirementsText}
              onChange={(e) => setFormData({ ...formData, requirementsText: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-black/40 outline-none resize-y"
              style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
            />
            <div className="flex items-center gap-3">
              <input id="active" type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
              <label htmlFor="active" style={{ color: "#E7E7E7" }}>Active</label>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: "#509887", color: "#090A0A" }}
            >
              <Save size={20} />
              {editingId ? 'Update' : 'Add'} Position
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {careers.map((career) => (
          <div 
            key={career.id}
            className="p-6 rounded-xl border"
            style={{ backgroundColor: "#0C0D0D", borderColor: "#1A1B1B" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "#E7E7E7" }}>{career.title}</h3>
                <p style={{ color: "#509887" }}>{career.department} • {career.location} • {career.type} {career.is_active ? '' : '(inactive)'}</p>
                <p className="mt-2 text-sm" style={{ color: "#8C8D8D" }}>{career.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(career)}
                  className="p-2 rounded hover:bg-white/10 transition-colors"
                  style={{ color: "#8C8D8D" }}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(career.id)}
                  className="p-2 rounded hover:bg-red-900/20 transition-colors"
                  style={{ color: "#EF4444" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioManagement({ portfolioItems, onRefresh }: { portfolioItems: PortfolioItem[], onRefresh: () => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    project_url: "",
    category: "",
    technologiesText: "",
    is_featured: false as boolean,
    order_index: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const technologies = formData.technologiesText
      .split(/\r?\n|,/)
      .map(s => s.trim())
      .filter(Boolean);
    const payload = {
      title: formData.title,
      description: formData.description,
      image_url: formData.image_url || null,
      project_url: formData.project_url || null,
      category: formData.category,
      technologies,
      is_featured: formData.is_featured,
      order_index: formData.order_index,
    };
    if (editingId) {
      await supabase.from('portfolio_items').update(payload).eq('id', editingId);
    } else {
      await supabase.from('portfolio_items').insert([payload]);
    }
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ title: "", description: "", image_url: "", project_url: "", category: "", technologiesText: "", is_featured: false, order_index: 0 });
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this portfolio item?')) {
      await supabase.from('portfolio_items').delete().eq('id', id);
      onRefresh();
    }
  }

  function startEdit(item: PortfolioItem) {
    setFormData({
      title: item.title,
      description: item.description,
      image_url: item.image_url || "",
      project_url: item.project_url || "",
      category: item.category,
      technologiesText: (item.technologies || []).join('\n'),
      is_featured: item.is_featured,
      order_index: item.order_index,
    });
    setEditingId(item.id);
    setShowAddForm(true);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: "#E7E7E7" }}>Portfolio Items</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: "#509887", color: "#090A0A" }}
        >
          <Plus size={20} />
          Add Project
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 rounded-xl border" style={{ backgroundColor: "#0C0D0D", borderColor: "#1A1B1B" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold" style={{ color: "#E7E7E7" }}>
              {editingId ? 'Edit' : 'Add'} Project
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({ title: "", description: "", image_url: "", project_url: "", category: "", technologiesText: "", is_featured: false, order_index: 0 });
              }}
              style={{ color: "#8C8D8D" }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
              <input
                required
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="url"
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
              <input
                type="url"
                placeholder="Project URL"
                value={formData.project_url}
                onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
            </div>
            <textarea
              required
              rows={4}
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-black/40 outline-none resize-y"
              style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
            />
            <textarea
              rows={3}
              placeholder="Technologies (one per line or comma-separated)"
              value={formData.technologiesText}
              onChange={(e) => setFormData({ ...formData, technologiesText: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-black/40 outline-none resize-y"
              style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
            />
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <input id="featured" type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} />
                <label htmlFor="featured" style={{ color: "#E7E7E7" }}>Featured</label>
              </div>
              <div className="flex items-center gap-3">
                <label style={{ color: "#E7E7E7" }}>Order</label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  className="w-28 px-3 py-2 rounded-lg bg-black/40 outline-none"
                  style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: "#509887", color: "#090A0A" }}
            >
              <Save size={20} />
              {editingId ? 'Update' : 'Add'} Project
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map((item) => (
          <div 
            key={item.id}
            className="p-6 rounded-xl border"
            style={{ backgroundColor: "#0C0D0D", borderColor: "#1A1B1B" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "#E7E7E7" }}>{item.title}</h3>
                <p style={{ color: "#509887" }}>{item.category} {item.is_featured ? '• Featured' : ''}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="p-2 rounded hover:bg-white/10 transition-colors"
                  style={{ color: "#8C8D8D" }}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded hover:bg-red-900/20 transition-colors"
                  style={{ color: "#EF4444" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm" style={{ color: "#8C8D8D" }}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientsManagement({ clients, onRefresh }: { clients: Client[], onRefresh: () => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    is_featured: false as boolean,
    order_index: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: formData.name,
      logo_url: formData.logo_url || null,
      website_url: formData.website_url || null,
      is_featured: formData.is_featured,
      order_index: formData.order_index,
    };
    if (editingId) {
      await supabase.from('clients').update(payload).eq('id', editingId);
    } else {
      await supabase.from('clients').insert([payload]);
    }
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ name: "", logo_url: "", website_url: "", is_featured: false, order_index: 0 });
    onRefresh();
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this client?')) {
      await supabase.from('clients').delete().eq('id', id);
      onRefresh();
    }
  }

  function startEdit(client: Client) {
    setFormData({
      name: client.name,
      logo_url: client.logo_url || "",
      website_url: client.website_url || "",
      is_featured: client.is_featured,
      order_index: client.order_index,
    });
    setEditingId(client.id);
    setShowAddForm(true);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: "#E7E7E7" }}>Clients & Partners</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: "#509887", color: "#090A0A" }}
        >
          <Plus size={20} />
          Add Client
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 rounded-xl border" style={{ backgroundColor: "#0C0D0D", borderColor: "#1A1B1B" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold" style={{ color: "#E7E7E7" }}>
              {editingId ? 'Edit' : 'Add'} Client
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({ name: "", logo_url: "", website_url: "", is_featured: false, order_index: 0 });
              }}
              style={{ color: "#8C8D8D" }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                type="text"
                placeholder="Client Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
              <input
                type="url"
                placeholder="Logo URL"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="url"
                placeholder="Website URL"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="px-4 py-3 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
              <div className="flex items-center gap-3">
                <input id="client_featured" type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} />
                <label htmlFor="client_featured" style={{ color: "#E7E7E7" }}>Featured</label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label style={{ color: "#E7E7E7" }}>Order</label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                className="w-28 px-3 py-2 rounded-lg bg-black/40 outline-none"
                style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: "#509887", color: "#090A0A" }}
            >
              <Save size={20} />
              {editingId ? 'Update' : 'Add'} Client
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {clients.map((client) => (
          <div 
            key={client.id}
            className="p-6 rounded-xl border"
            style={{ backgroundColor: "#0C0D0D", borderColor: "#1A1B1B" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "#E7E7E7" }}>{client.name}</h3>
                {client.is_featured && (
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "#509887", color: "#090A0A" }}>
                    Featured
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(client)}
                  className="p-2 rounded hover:bg-white/10 transition-colors"
                  style={{ color: "#8C8D8D" }}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 rounded hover:bg-red-900/20 transition-colors"
                  style={{ color: "#EF4444" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}