"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Navigation from "../components/Navigation";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<'team' | 'careers' | 'portfolio' | 'clients'>('team');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchData();
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

  return (
    <>
      <Navigation />
      
      <div className="font-sans min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8" style={{ color: "#E7E7E7" }}>
            Admin Panel
          </h1>
          
          {/* Tab Navigation */}
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

          {/* Content Area */}
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
            
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-black/40 outline-none"
              style={{ color: "#E7E7E7", border: "1px solid #1F2020" }}
            />
            
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
  // Similar implementation for careers management
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: "#E7E7E7" }}>Career Positions</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: "#509887", color: "#090A0A" }}
        >
          <Plus size={20} />
          Add Position
        </button>
      </div>
      
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
                <p style={{ color: "#509887" }}>{career.department} • {career.location} • {career.type}</p>
                <p className="mt-2 text-sm" style={{ color: "#8C8D8D" }}>{career.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 rounded hover:bg-white/10 transition-colors"
                  style={{ color: "#8C8D8D" }}
                >
                  <Edit size={16} />
                </button>
                <button
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
  // Similar implementation for portfolio management
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: "#E7E7E7" }}>Portfolio Items</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: "#509887", color: "#090A0A" }}
        >
          <Plus size={20} />
          Add Project
        </button>
      </div>
      
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
                <p style={{ color: "#509887" }}>{item.category}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 rounded hover:bg-white/10 transition-colors"
                  style={{ color: "#8C8D8D" }}
                >
                  <Edit size={16} />
                </button>
                <button
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
  // Similar implementation for clients management
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold" style={{ color: "#E7E7E7" }}>Clients & Partners</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: "#509887", color: "#090A0A" }}
        >
          <Plus size={20} />
          Add Client
        </button>
      </div>
      
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
                  className="p-2 rounded hover:bg-white/10 transition-colors"
                  style={{ color: "#8C8D8D" }}
                >
                  <Edit size={16} />
                </button>
                <button
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