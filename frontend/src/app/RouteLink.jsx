export const navigateTo = (path) => {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }

  window.dispatchEvent(new Event('popstate'));
  window.scrollTo({ top: 0, left: 0 });
};

export function RouteLink({ to, children, onClick, ...props }) {
  const handleClick = (event) => {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.altKey
      || event.ctrlKey
      || event.shiftKey
    ) {
      return;
    }

    onClick?.(event);

    if (!event.defaultPrevented) {
      event.preventDefault();
      navigateTo(to);
    }
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
