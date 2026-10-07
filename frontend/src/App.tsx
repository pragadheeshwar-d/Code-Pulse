import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { ConnectModal } from './components/ConnectModal';
import { CreateGoalModal } from './components/CreateGoalModal';
import { PlatformDetailModal } from './components/PlatformDetailModal';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CommandPalette } from './components/CommandPalette';
import { ToastProvider, useToast } from './components/Toast';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { PlatformsPage } from './pages/PlatformsPage';
import { ProblemsPage } from './pages/ProblemsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { GoalsPage } from './pages/GoalsPage';
import { ContestsPage } from './pages/ContestsPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';
import { GitHubPage } from './pages/GitHubPage';

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

const MainAppContent: React.FC = () => {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
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
  const [syncError, setSyncError] = useState<string | null>(null);

  // Modals & Command Palette state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectDefaultPlatform, setConnectDefaultPlatform] = useState<PlatformType>('leetcode');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isPlatformDetailModalOpen, setIsPlatformDetailModalOpen] = useState(false);
  const [selectedDetailPlatform, setSelectedDetailPlatform] = useState<PlatformCardData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setSettings(null);
    setAuthStatus('unauthenticated');
    toastInfo('Logged out', 'You have been safely signed out.');
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
        const u = profileRes.user || ((profileRes as any).id ? (profileRes as any) : null);
        const s = profileRes.settings || ((profileRes as any).auto_sync_interval ? (profileRes as any) : null);
        if (u) setUser(u);
        if (s) setSettings(s);
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

  // Periodic automatic background refresh (every 2 minutes)
  useEffect(() => {
    if (authStatus !== 'authenticated') return;

    const interval = setInterval(() => {
      loadAllData();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [authStatus, loadAllData]);

  // Auto-sync connected platforms on load if stale (>15m)
  const initialSyncRef = React.useRef(false);
  useEffect(() => {
    if (authStatus !== 'authenticated' || platforms.length === 0 || initialSyncRef.current) return;
    const connected = platforms.filter(p => p.connected);
    if (connected.length === 0) return;

    const needsSync = connected.some(p => {
      if (!p.last_synced_at) return true;
      const diffMs = Date.now() - new Date(p.last_synced_at).getTime();
      return diffMs > 15 * 60 * 1000;
    });

    if (needsSync && !isSyncing) {
      initialSyncRef.current = true;
      handleSyncAll();
    }
  }, [authStatus, platforms, isSyncing]);

  // Sync All
  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      await api.syncAll();
      await loadAllData();
      toastSuccess('Sync completed', 'Connected coding profiles refreshed successfully.');
    } catch (err: any) {
      const msg = err?.message || 'Sync failed';
      setSyncError(msg);
      toastError('Sync error', msg);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync Single Platform
  const handleSyncPlatform = async (platform: PlatformType) => {
    try {
      await api.syncPlatform(platform);
      await loadAllData();
      toastSuccess('Platform synced', `${platform} stats updated.`);
    } catch (err: any) {
      toastError('Sync failed', err?.message || `Could not sync ${platform}`);
      throw err;
    }
  };

  // Connect platform
  const handleConnectPlatform = async (platform: PlatformType, username: string) => {
    try {
      await api.connectPlatform(platform, username);
      await loadAllData();
      toastSuccess('Platform connected', `${platform} account @${username} linked.`);
    } catch (err: any) {
      toastError('Connection failed', err?.message || `Could not connect ${platform}`);
      throw err;
    }
  };

  // Disconnect platform
  const handleDisconnectPlatform = async (platform: PlatformType) => {
    try {
      await api.disconnectPlatform(platform);
      await loadAllData();
      toastInfo('Platform disconnected', `${platform} account removed.`);
    } catch (err: any) {
      toastError('Disconnect failed', err?.message || `Could not disconnect ${platform}`);
      throw err;
    }
  };

  // Create Goal
  const handleCreateGoal = async (goalData: any) => {
    try {
      await api.createGoal(goalData);
      await loadAllData();
      toastSuccess('Goal created', `Milestone target "${goalData.title}" set.`);
    } catch (err: any) {
      toastError('Failed to create goal', err?.message);
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (id: string) => {
    try {
      await api.deleteGoal(id);
      await loadAllData();
      toastInfo('Goal removed', 'Milestone target deleted.');
    } catch (err: any) {
      toastError('Failed to delete goal', err?.message);
    }
  };

  // Update Profile
  const handleUpdateProfile = async (data: any) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
    setSettings(res.settings);
    toastSuccess('Profile saved', 'Account preferences updated.');
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
    let latestSync = overview?.last_synced_at || null;
    if (!latestSync && platforms && platforms.length > 0) {
      for (const p of platforms) {
        const pSync = p.last_synced_at || p.stats?.recorded_at || null;
        if (pSync && (!latestSync || pSync > latestSync)) {
          latestSync = pSync;
        }
      }
    }
    if (!latestSync) return 'Never';
    try {
      const diffSec = Math.floor((Date.now() - new Date(latestSync).getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return 'Never';
    }
  };

  if (authStatus === 'checking') {
    return <div className="min-h-screen bg-[var(--bg)]" aria-label="Checking session" />;
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
          toastSuccess('Welcome to CodePulse', `Signed in as ${newUser.name || newUser.email}`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[var(--bg)] text-[var(--text)]">
      <div className="min-h-screen min-h-[100dvh] flex flex-col lg:grid lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
        {/* Sidebar: Desktop persistent + Mobile drawer */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            setIsMobileMenuOpen(false);
          }}
          user={user}
          lastSyncedText={getLastSyncedText()}
          isSyncing={isSyncing}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Main Content Column */}
        <div className="min-w-0 w-auto flex flex-col flex-1">
          {/* Top Header: Sticky compact on mobile */}
          <Header
            user={user}
            lastSyncedText={getLastSyncedText()}
            isSyncing={isSyncing}
            syncError={syncError}
            onSync={handleSyncAll}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenProfile={() => {
              setCurrentTab('settings');
              setIsMobileMenuOpen(false);
            }}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            variant="mobile"
          />

          <main className="flex-1 min-w-0 w-full px-3 xs:px-4 sm:px-6 lg:px-6 xl:px-8 pt-3 xs:pt-4 sm:pt-6 content-bottom-safe">
            {/* Desktop Top Header Banner */}
            <Header
              user={user}
              lastSyncedText={getLastSyncedText()}
              isSyncing={isSyncing}
              syncError={syncError}
              onSync={handleSyncAll}
              onOpenProfile={() => {
                setCurrentTab('settings');
              }}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              currentTab={currentTab}
              variant="desktop"
            />

            {/* Page Views */}
            {currentTab === 'dashboard' && (
              <DashboardPage
                overview={overview}
                platforms={platforms}
                chartData={chartData}
                period={chartPeriod}
                onPeriodChange={setChartPeriod}
                recentProblems={recentProblems}
                insights={insights}
                goals={goals}
                onConnectPlatform={openConnectModal}
                onViewAllProblems={() => setCurrentTab('problems')}
                onCreateGoal={() => setIsGoalModalOpen(true)}
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
                recentProblems={recentProblems}
              />
            )}

            {currentTab === 'github' && (
              <GitHubPage user={user} />
            )}

            {currentTab === 'settings' && (
              <SettingsPage
                user={user}
                settings={settings}
                platforms={platforms}
                syncLogs={syncLogs}
                onUpdateProfile={handleUpdateProfile}
                onDisconnectPlatform={handleDisconnectPlatform}
                onConnectPlatform={openConnectModal}
                onLogout={handleLogout}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (< lg) */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setIsMobileMenuOpen(false);
        }}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          setIsMobileMenuOpen(false);
        }}
        onSync={handleSyncAll}
        onCreateGoal={() => setIsGoalModalOpen(true)}
        onConnectPlatform={() => openConnectModal('leetcode')}
      />

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

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
};
