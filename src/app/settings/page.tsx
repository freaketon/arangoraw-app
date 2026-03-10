'use client';

import { useEffect, useState } from 'react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'agents' | 'prompts' | 'system'>('agents');

  useEffect(() => {
    async function load() {
      try {
        const [agentRes, templateRes] = await Promise.all([
          fetch('/api/agents?stats=true'),
          fetch('/api/search?type=prompt_templates'),
        ]);
        const agentData = agentRes.ok ? await agentRes.json() : [];
        const templateData = templateRes.ok ? await templateRes.json() : [];
        setAgents(Array.isArray(agentData) ? agentData : []);
        setTemplates(Array.isArray(templateData) ? templateData : []);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const sections = [
    { key: 'agents' as const, label: 'Agent Registry' },
    { key: 'prompts' as const, label: 'Prompt Templates' },
    { key: 'system' as const, label: 'System' },
  ];

  if (loading) return <div className="text-text-muted text-sm text-center py-12">Loading settings...</div>;

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-48 shrink-0 space-y-1">
        {sections.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)}
            className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${activeSection === s.key ? 'bg-bg-tertiary text-text-primary border border-accent-gold-dim' : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeSection === 'agents' && <AgentRegistry agents={agents} />}
        {activeSection === 'prompts' && <PromptTemplates templates={templates} />}
        {activeSection === 'system' && <SystemSettings />}
      </div>
    </div>
  );
}

function AgentRegistry({ agents }: { agents: any[] }) {
  const AGENT_DEFS = [
    { name: 'Story Intake Agent', role: 'Processes raw memories into enriched story records', color: 'text-accent-gold' },
    { name: 'Research Agent', role: 'Finds and validates references for episodes', color: 'text-accent-blue' },
    { name: 'Scripting Agent', role: 'Generates Julian Loop scripts from story + research', color: 'text-accent-purple' },
    { name: 'Metadata Agent', role: 'Creates SEO-optimized titles, descriptions, tags', color: 'text-accent-amber' },
    { name: 'Thumbnail Agent', role: 'Generates thumbnail concepts and briefs', color: 'text-accent-red' },
    { name: 'Shorts Agent', role: 'Extracts and packages short-form clips', color: 'text-accent-green' },
    { name: 'Publishing Agent', role: 'Orchestrates multi-platform distribution', color: 'text-accent-blue' },
    { name: 'Analytics Agent', role: 'Monitors performance and generates insights', color: 'text-accent-gold' },
    { name: 'Recommendation Agent', role: 'Suggests topics, angles, and improvements', color: 'text-accent-purple' },
    { name: 'Weekly Planning Agent', role: 'Plans content calendar and episode scheduling', color: 'text-accent-amber' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-text-primary">Agent Registry</h3>
      <div className="text-xs text-text-muted mb-4">10 AI agents powering the ArangoRAW media system. One human, ten agents.</div>
      <div className="space-y-3">
        {AGENT_DEFS.map(agent => (
          <Card key={agent.name}>
            <CardBody className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-sm font-medium ${agent.color}`}>{agent.name}</span>
                  <div className="text-xs text-text-muted mt-0.5">{agent.role}</div>
                </div>
                <Badge variant="green">Active</Badge>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PromptTemplates({ templates }: { templates: any[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-primary">Prompt Templates</h3>
        <Button size="sm" variant="secondary">+ New Template</Button>
      </div>
      {templates.length === 0 ? (
        <div className="text-xs text-text-muted py-8 text-center">No prompt templates configured yet. Templates control how each agent generates output.</div>
      ) : (
        <div className="space-y-3">
          {templates.map((t: any) => (
            <Card key={t.template_id}>
              <CardBody className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-text-primary">{t.name || t.agent_name || 'Unnamed Template'}</div>
                    <div className="text-xs text-text-muted mt-0.5">v{t.version || 1} Â· {t.agent_name || 'â'}</div>
                  </div>
                  <Badge variant={t.is_active ? 'green' : 'muted'}>{t.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SystemSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-text-primary">System Configuration</h3>

      <Card>
        <CardHeader><span className="text-sm font-medium">Storage</span></CardHeader>
        <CardBody>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Storage Engine</span>
              <span className="text-text-secondary">JSON File Store (v1)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Data Directory</span>
              <span className="text-text-secondary font-mono">./data/</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Migration Path</span>
              <span className="text-text-secondary">PostgreSQL (v2)</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><span className="text-sm font-medium">Content Pillars</span></CardHeader>
        <CardBody>
          <div className="space-y-1.5">
            {['Psychology of Chaos', 'Media Intelligence', 'Identity Shift', 'Physics of Business', 'The Survivor', 'External Mirrors'].map(p => (
              <div key={p} className="text-xs text-text-secondary py-1 px-2 bg-bg-tertiary rounded">{p}</div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><span className="text-sm font-medium">Story Eras</span></CardHeader>
        <CardBody>
          <div className="space-y-1.5">
            {['Colombia', 'Immigration', 'Corporate', 'Founder', 'Family', 'Philosophical', 'Meta'].map(e => (
              <div key={e} className="text-xs text-text-secondary py-1 px-2 bg-bg-tertiary rounded">{e}</div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><span className="text-sm font-medium">Julian Loop</span></CardHeader>
        <CardBody>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-amber" /> <span className="text-accent-amber">Hook</span> <span className="text-text-muted">â Opening hook, first 30 seconds</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-gold" /> <span className="text-accent-gold">Artifact</span> <span className="text-text-muted">â Surface-level discovery</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-purple" /> <span className="text-accent-purple">Labyrinth</span> <span className="text-text-muted">â Deep exploration</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-red" /> <span className="text-accent-red">Twist</span> <span className="text-text-muted">â Unexpected reframe</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-blue" /> <span className="text-accent-blue">Echo</span> <span className="text-text-muted">â What stays with the viewer</span></div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
