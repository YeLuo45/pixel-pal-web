import React, { useState } from 'react';

/**
 * V134: TransferPanel — tabbed Send/Receive/Social interface
 */
export function TransferPanel() {
  const [tab, setTab] = useState<'send' | 'receive' | 'social'>('send');

  return (
    <div className="transfer-panel">
      <div className="transfer-tabs">
        <button onClick={() => setTab('send')} className={tab === 'send' ? 'active' : ''}>Send</button>
        <button onClick={() => setTab('receive')} className={tab === 'receive' ? 'active' : ''}>Receive</button>
        <button onClick={() => setTab('social')} className={tab === 'social' ? 'active' : ''}>Social</button>
      </div>
      <div className="transfer-content">
        {tab === 'send' && <SendView />}
        {tab === 'receive' && <ReceiveView />}
        {tab === 'social' && <SocialView />}
      </div>
    </div>
  );
}

function SendView() {
  return (
    <div className="transfer-send">
      <p>Select a skill to transfer via QR code, link, or API.</p>
      <p className="muted">Skill selection UI — connects to skillRegistry</p>
    </div>
  );
}

function ReceiveView() {
  return (
    <div className="transfer-receive">
      <p>Paste a transfer link or scan a QR code to receive a skill.</p>
      <input type="text" placeholder="Paste transfer link here..." className="transfer-link-input" />
      <button>Install Skill</button>
    </div>
  );
}

function SocialView() {
  return (
    <div className="transfer-social">
      <h4>Skill Leaderboard</h4>
      <p className="muted">Top skills by downloads and ratings</p>
    </div>
  );
}
