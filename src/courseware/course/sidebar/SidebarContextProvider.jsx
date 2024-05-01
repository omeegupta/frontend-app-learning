import { breakpoints, useWindowSize } from '@openedx/paragon';
import PropTypes from 'prop-types';
import React, {
  useState, useMemo, useCallback, useEffect,
} from 'react';

import { useModel } from '../../../generic/model-store';
import { getLocalStorage, setLocalStorage } from '../../../data/localStorage';

import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

const getSidebar = ({
  shouldDisplaySidebarOpen,
  query,
  verifiedMode,
}) => {
  let sidebar;
  if (verifiedMode) {
    sidebar = SIDEBARS.NOTIFICATIONS.ID;
  } else {
    sidebar = shouldDisplaySidebarOpen || query.get('sidebar') === 'true'
      ? SIDEBARS.DISCUSSIONS.ID
      : null;
  }
  return sidebar;
};

const SidebarProvider = ({
  courseId,
  unitId,
  children,
}) => {
  const { verifiedMode } = useModel('courseHomeMeta', courseId);
  const shouldDisplayFullScreen = useWindowSize().width < breakpoints.large.minWidth;
  const shouldDisplaySidebarOpen = useWindowSize().width > breakpoints.medium.minWidth;
  const query = new URLSearchParams(window.location.search);

  // for mobile users, we want to persist the sidebar state
  const initialSidebar = shouldDisplayFullScreen ? getLocalStorage(`sidebar.${courseId}`) : getSidebar({
    shouldDisplaySidebarOpen,
    query,
    verifiedMode,
  });
  const [currentSidebar, setCurrentSidebar] = useState(initialSidebar);
  const [notificationStatus, setNotificationStatus] = useState(getLocalStorage(`notificationStatus.${courseId}`));
  const [upgradeNotificationCurrentState, setUpgradeNotificationCurrentState] = useState(getLocalStorage(`upgradeNotificationCurrentState.${courseId}`));

  useEffect(() => {
    // do not retrigger the sidebar on unit change for mobile view
    if (!shouldDisplayFullScreen) {
      setCurrentSidebar(getSidebar({
        shouldDisplaySidebarOpen,
        query,
        verifiedMode,
      }));
    }
  }, [unitId]);

  const onNotificationSeen = useCallback(() => {
    setNotificationStatus('inactive');
    setLocalStorage(`notificationStatus.${courseId}`, 'inactive');
  }, [courseId]);

  const toggleSidebar = useCallback((sidebarId) => {
    // Switch to new sidebar or hide the current sidebar
    const newSidebar = sidebarId === currentSidebar ? null : sidebarId;
    setCurrentSidebar(newSidebar);
    setLocalStorage(`sidebar.${courseId}`, newSidebar);
  }, [currentSidebar]);

  const contextValue = useMemo(() => ({
    toggleSidebar,
    onNotificationSeen,
    setNotificationStatus,
    currentSidebar,
    notificationStatus,
    upgradeNotificationCurrentState,
    setUpgradeNotificationCurrentState,
    shouldDisplaySidebarOpen,
    shouldDisplayFullScreen,
    courseId,
    unitId,
  }), [courseId, currentSidebar, notificationStatus, onNotificationSeen, shouldDisplayFullScreen,
    shouldDisplaySidebarOpen, toggleSidebar, unitId, upgradeNotificationCurrentState]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

SidebarProvider.propTypes = {
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  children: PropTypes.node,
};

SidebarProvider.defaultProps = {
  children: null,
};

export default SidebarProvider;
