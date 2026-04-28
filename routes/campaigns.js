const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// ============================================================
//  データストア
//  現在: インメモリ（モック）
//  後でFirebase Firestoreに差し替え → コメントアウト箇所を参照
// ============================================================

// --- モックデータ（初期表示用）---
let campaigns = [
  {
    id: 'cmp-001',
    name: '春季セールキャンペーン2025',
    platforms: ['google'],
    status: 'active',
    goal: 'sales',
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    budgetMin: 3000,
    budgetMax: 15000,
    bidStrategy: '自動入札（目標コンバージョン単価）',
    targets: ['25〜34歳', '35〜44歳', '女性'],
    areas: ['関東', '東京都', '大阪府'],
    devices: ['スマートフォン', 'PC / デスクトップ'],
    adType: 'search',
    headline1: '春の大セール開催中',
    headline2: '最大50%OFF',
    description: '期間限定！人気商品が大幅値下げ。今すぐチェック。',
    finalUrl: 'example.com/spring-sale',
    impressions: 142800,
    clicks: 3240,
    ctr: 2.27,
    cost: 89400,
    conversions: 156,
    createdAt: '2025-02-20T10:00:00Z'
  },
  {
    id: 'cmp-002',
    name: 'ブランド認知動画キャンペーン',
    platforms: ['youtube'],
    status: 'active',
    goal: 'awareness',
    startDate: '2025-04-01',
    endDate: '2025-04-30',
    budgetMin: 5000,
    budgetMax: 30000,
    bidStrategy: 'コンバージョン数の最大化',
    targets: ['18〜24歳', '25〜34歳'],
    areas: ['日本全国'],
    devices: ['スマートフォン', 'スマートTV'],
    ytFormat: 'skippable',
    videoId: 'dQw4w9WgXcQ',
    videoTitle: '新ブランドムービー2025',
    ytCta: '詳しくはこちら',
    ytUrl: 'example.com/brand',
    impressions: 310500,
    clicks: 4120,
    ctr: 1.33,
    cost: 124800,
    conversions: 89,
    createdAt: '2025-03-15T09:00:00Z'
  },
  {
    id: 'cmp-003',
    name: 'GWリターゲティング施策',
    platforms: ['google', 'youtube'],
    status: 'scheduled',
    goal: 'traffic',
    startDate: '2025-04-29',
    endDate: '2025-05-06',
    budgetMin: 2000,
    budgetMax: 10000,
    bidStrategy: '手動 CPC',
    targets: ['35〜44歳', '45〜54歳', '男性'],
    areas: ['関東', '関西'],
    devices: ['PC / デスクトップ', 'タブレット'],
    adType: 'display',
    headline1: 'GW特別キャンペーン',
    headline2: '期間限定オファー',
    description: 'ゴールデンウィーク限定！特別価格でご提供します。',
    finalUrl: 'example.com/gw',
    impressions: 0,
    clicks: 0,
    ctr: 0,
    cost: 0,
    conversions: 0,
    createdAt: '2025-04-10T14:00:00Z'
  },
  {
    id: 'cmp-004',
    name: '冬季インフルエンザ対策LP',
    platforms: ['google'],
    status: 'ended',
    goal: 'leads',
    startDate: '2025-01-10',
    endDate: '2025-02-28',
    budgetMin: 1000,
    budgetMax: 8000,
    bidStrategy: '目標 CPA',
    targets: ['45〜54歳', '55歳以上'],
    areas: ['日本全国'],
    devices: ['スマートフォン', 'PC / デスクトップ'],
    adType: 'search',
    headline1: 'インフルエンザ対策グッズ',
    headline2: '送料無料でお届け',
    description: '医師推奨。家族みんなを守る感染対策セット。',
    finalUrl: 'example.com/flu',
    impressions: 98400,
    clicks: 2180,
    ctr: 2.21,
    cost: 64200,
    conversions: 210,
    createdAt: '2025-01-05T11:00:00Z'
  }
];

// ============================================================
//  Firebase Firestore 差し替え用スタブ
//  後で以下のように書き換えてください：
//
//  const admin = require('firebase-admin');
//  const db = admin.firestore();
//
//  async function getCampaigns() {
//    const snap = await db.collection('campaigns').orderBy('createdAt','desc').get();
//    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
//  }
//  async function saveCampaign(data) {
//    const ref = db.collection('campaigns').doc(data.id);
//    await ref.set(data);
//    return data;
//  }
//  async function deleteCampaign(id) {
//    await db.collection('campaigns').doc(id).delete();
//  }
// ============================================================

function getCampaigns()          { return Promise.resolve([...campaigns]); }
function saveCampaign(data)      { campaigns.push(data); return Promise.resolve(data); }
function updateCampaign(id, upd) {
  const i = campaigns.findIndex(c => c.id === id);
  if (i === -1) return Promise.resolve(null);
  campaigns[i] = { ...campaigns[i], ...upd };
  return Promise.resolve(campaigns[i]);
}
function deleteCampaign(id) {
  const before = campaigns.length;
  campaigns = campaigns.filter(c => c.id !== id);
  return Promise.resolve(campaigns.length < before);
}

// GET /api/campaigns
router.get('/', async (req, res) => {
  const list = await getCampaigns();
  res.json({ campaigns: list });
});

// GET /api/campaigns/:id
router.get('/:id', async (req, res) => {
  const list = await getCampaigns();
  const c = list.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(c);
});

// POST /api/campaigns
router.post('/', async (req, res) => {
  const data = {
    id: 'cmp-' + uuidv4().slice(0, 8),
    ...req.body,
    status: 'scheduled',
    impressions: 0, clicks: 0, ctr: 0, cost: 0, conversions: 0,
    createdAt: new Date().toISOString()
  };
  await saveCampaign(data);
  res.status(201).json(data);
});

// PATCH /api/campaigns/:id
router.patch('/:id', async (req, res) => {
  const updated = await updateCampaign(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

// DELETE /api/campaigns/:id
router.delete('/:id', async (req, res) => {
  const ok = await deleteCampaign(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
