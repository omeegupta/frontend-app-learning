import { breakpoints, useWindowSize } from '@openedx/paragon';
import PropTypes from 'prop-types';
import React, { useState, useMemo, useCallback } from 'react';

import { useModel } from '../../../generic/model-store';
import { getLocalStorage, setLocalStorage } from '../../../data/localStorage';

import SidebarContext from './SidebarContext';
import { SIDEBARS } from './sidebars';

const SidebarProvider = ({
  courseId,
  unitId,
  children,
}) => {
  const { verifiedMode } = useModel('courseHomeMeta', courseId);
  const shouldDisplayFullScreen = useWindowSize().width < breakpoints.large.minWidth;
  const shouldDisplaySidebarOpen = useWindowSize().width > breakpoints.medium.minWidth;
  const query = new URLSearchParams(window.location.search);

  let initialSidebar = shouldDisplayFullScreen ? getLocalStorage(`sidebar.${courseId}`) : null;
  if (!initialSidebar) {
    if (verifiedMode) {
      initialSidebar = SIDEBARS.NOTIFICATIONS.ID;
    } else {
      initialSidebar = shouldDisplaySidebarOpen || query.get('sidebar') === 'true'
        ? SIDEBARS.DISCUSSIONS.ID
        : null;
    }
  }

  const [currentSidebar, setCurrentSidebar] = useState(initialSidebar);
  const [notificationStatus, setNotificationStatus] = useState(getLocalStorage(`notificationStatus.${courseId}`));
  const [upgradeNotificationCurrentState, setUpgradeNotificationCurrentState] = useState(getLocalStorage(`upgradeNotificationCurrentState.${courseId}`));

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
