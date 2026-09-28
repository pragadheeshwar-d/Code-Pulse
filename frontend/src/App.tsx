import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { ConnectModal } from './components/ConnectModal';
import { CreateGoalModal } from './components/CreateGoalModal';
import { PlatformDetailModal } from './components/PlatformDetailModal';
import { AuthModal } from './components/AuthModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { PlatformsPage } from './pages/PlatformsPage';
import { ProblemsPage } from './pages/ProblemsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { GoalsPage } from './pages/GoalsPage';
import { ContestsPage } from './pages/ContestsPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';

// API & Types
import { api, getAuthToken, removeAuthToken } from './services/api';
import {
  PlatformCardData,
  DashboardOverview,
  ChartPoint,
  HeatmapDay,
  DifficultyData,
  TopicData,
  RecentProblem,
  Goal,
  ContestRecord,
  SyncLog,
  UserProfile,
  UserSettings,
  PlatformType
} from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [authStatus, setAuthStatus] = useState<'checking' | 'unauthenticated' | 'authenticated'>('checking');

  // Application State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [platforms, setPlatforms] = useState<PlatformCardData[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartPeriod, setChartPeriod] = useState<string>('30d');
  const [activityData, setActivityData] = useState<HeatmapDay[]>([]);
  const [activityPlatform, setActivityPlatform] = useState<string>('all');
  const [difficultyData, setDifficultyData] = useState<DifficultyData>({
    easy: { count: 0, percentage: 0 },
    medium: { count: 0, percentage: 0 },
    hard: { count: 0, percentage: 0 },
    total: 0
  });
  const [topicsData, setTopicsData] = useState<TopicData[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recentProblems, setRecentProblems] = useState<RecentProblem[]>([]);
  const [contests, setContests] = useState<ContestRecord[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  // Syncing & UI loading state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectDefaultPlatform, setConnectDefaultPlatform] = useState<PlatformType>('leetcode');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isPlatformDetailModalOpen, setIsPlatformDetailModalOpen] = useState(false);
  const [selectedDetailPlatform, setSelectedDetailPlatform] = useState<PlatformCardData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setSettings(null);
    setAuthStatus('unauthenticated');
  };

  // Load all initial application data
  const loadAllData = useCallback(async () => {
    if (authStatus !== 'authenticated') return;
    try {
      const [
        profileRes,
        platformsRes,
        statsRes,
        historyRes,
        activityRes,
        goalsRes,
        problemsRes,
        contestsRes,
        analyticsRes,
        logsRes
      ] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getPlatforms().catch(() => []),
        api.getStats().catch(() => null),
        api.getStatsHistory(chartPeriod).catch(() => []),
        api.getActivity(activityPlatform).catch(() => []),
        api.getGoals().catch(() => []),
        api.getProblems(500).catch(() => []),
        api.getContests().catch(() => []),
        api.getAnalytics().catch(() => null),
        api.getSyncLogs().catch(() => [])
      ]);

      if (profileRes) {
        setUser(profileRes.user);
        setSettings(profileRes.settings);
      }
      if (platformsRes) setPlatforms(platformsRes);
      if (statsRes) setOverview(statsRes);
      if (historyRes) setChartData(historyRes);
      if (activityRes) setActivityData(activityRes);
      if (goalsRes) setGoals(goalsRes);
      if (problemsRes) setRecentProblems(problemsRes);
      if (contestsRes) setContests(contestsRes);
      if (analyticsRes) {
        setDifficultyData(analyticsRes.difficulty);
        setTopicsData(analyticsRes.topics);
        setInsights(analyticsRes.insights || []);
      }
      if (logsRes) setSyncLogs(logsRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }, [authStatus, chartPeriod, activityPlatform]);

  // Validate the saved session before rendering any protected app content.
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!getAuthToken()) {
        if (active) setAuthStatus('unauthenticated');
        return;
      }

      try {
        const session = await api.getMe();
        if (!active) return;
        setUser(session.user);
        setSettings(session.settings);
        setAuthStatus('authenticated');
      } catch {
        removeAuthToken();
        if (active) setAuthStatus('unauthenticated');
      }
    };

    restoreSession();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Sync All
  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      await api.syncAll();
      await loadAllData();
    } catch (err) {
      console.error('Sync all error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync Single Platform
  const handleSyncPlatform = async (platform: PlatformType) => {
    await api.syncPlatform(platform);
    await loadAllData();
  };

  // Connect platform
  const handleConnectPlatform = async (platform: PlatformType, username: string) => {
    await api.connectPlatform(platform, username);
    await loadAllData();
  };

  // Disconnect platform
  const handleDisconnectPlatform = async (platform: PlatformType) => {
    await api.disconnectPlatform(platform);
    await loadAllData();
  };

  // Create Goal
  const handleCreateGoal = async (goalData: any) => {
    await api.createGoal(goalData);
    await loadAllData();
  };

  // Delete Goal
  const handleDeleteGoal = async (id: string) => {
    await api.deleteGoal(id);
    await loadAllData();
  };

  // Update Profile
  const handleUpdateProfile = async (data: any) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
    setSettings(res.settings);
  };

  // Modal open helpers
  const openConnectModal = (platform: PlatformType = 'leetcode') => {
    setConnectDefaultPlatform(platform);
    setIsConnectModalOpen(true);
  };

  const openPlatformDetail = (platform: PlatformType) => {
    const pData = platforms.find(p => p.platform === platform) || null;
    setSelectedDetailPlatform(pData);
    setIsPlatformDetailModalOpen(true);
  };

  // Format last synced text
  const getLastSyncedText = () => {
    if (!overview?.last_synced_at) return 'Never';
    try {
      const diffSec = Math.floor((Date.now() - new Date(overview.last_synced_at).getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return 'Never';
    }
  };

  if (authStatus === 'checking') {
    return <div className="min-h-screen bg-[#090d16]" aria-label="Checking your session" />;
  }

  if (authStatus === 'unauthenticated') {
    return (
      <AuthModal
        isOpen
        allowClose={false}
        onClose={() => undefined}
        onSuccess={(newUser) => {
          setUser(newUser);
          setAuthStatus('authenticated');
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#090d16] text-[#e2e8f0]">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        user={user}
        lastSyncedText={getLastSyncedText()}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Top Header */}
          <Header
            user={user}
            lastSyncedText={getLastSyncedText()}
            isSyncing={isSyncing}
            onSync={handleSyncAll}
          />

          {/* Page Routing */}
          {currentTab === 'dashboard' && (
            <DashboardPage
              overview={overview}
              platforms={platforms}
              chartData={chartData}
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
              activityData={activityData}
              selectedPlatform={activityPlatform}
              onSelectPlatform={setActivityPlatform}
              difficultyData={difficultyData}
              topicsData={topicsData}
              goals={goals}
              recentProblems={recentProblems}
              insights={insights}
              onConnectPlatform={openConnectModal}
              onManagePlatform={openPlatformDetail}
              onCreateGoal={() => setIsGoalModalOpen(true)}
              onViewAllProblems={() => setCurrentTab('problems')}
              onViewAllGoals={() => setCurrentTab('goals')}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {currentTab === 'platforms' && (
            <PlatformsPage
              platforms={platforms}
              onConnect={openConnectModal}
              onManage={openPlatformDetail}
              onSyncAll={handleSyncAll}
              isSyncing={isSyncing}
            />
          )}

          {currentTab === 'problems' && (
            <ProblemsPage
              problems={recentProblems}
              onConnectClick={() => openConnectModal('leetcode')}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage
              chartData={chartData}
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
              difficultyData={difficultyData}
              topicsData={topicsData}
              insights={insights}
              anyConnected={platforms.some(p => p.connected)}
              onConnectClick={() => openConnectModal('leetcode')}
            />
          )}

          {currentTab === 'goals' && (
            <GoalsPage
              goals={goals}
              onCreateClick={() => setIsGoalModalOpen(true)}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {currentTab === 'contests' && (
            <ContestsPage
              contests={contests}
              onConnectClick={() => openConnectModal('codeforces')}
            />
          )}

          {currentTab === 'activity' && (
            <ActivityPage
              activityData={activityData}
              selectedPlatform={activityPlatform}
              onSelectPlatform={setActivityPlatform}
              overview={overview}
              onConnectClick={() => openConnectModal('leetcode')}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              user={user}
              settings={settings}
              platforms={platforms}
              syncLogs={syncLogs}
              onUpdateProfile={handleUpdateProfile}
              onDisconnectPlatform={handleDisconnectPlatform}
            />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        defaultPlatform={connectDefaultPlatform}
        onConnect={handleConnectPlatform}
      />

      <CreateGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onCreate={handleCreateGoal}
      />

      <PlatformDetailModal
        isOpen={isPlatformDetailModalOpen}
        onClose={() => setIsPlatformDetailModalOpen(false)}
        platformData={selectedDetailPlatform}
        onSync={handleSyncPlatform}
        onDisconnect={handleDisconnectPlatform}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(newUser) => {
          setUser(newUser);
          setAuthStatus('authenticated');
          loadAllData();
        }}
      />
    </div>
  );
};
