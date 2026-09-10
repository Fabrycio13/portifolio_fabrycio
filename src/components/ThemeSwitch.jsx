import './ThemeSwitch.css'

export function ThemeSwitch() {
  return (
    <div className="theme-switch-control">
      <label className="theme-switch" title="Seletor de idioma em preparação">
        <input
          className="theme-switch__checkbox"
          type="checkbox"
          aria-label="Alternar visualmente entre português e inglês"
        />

        <span className="theme-switch__container">
          <span className="theme-switch__language theme-switch__language--pt">PT</span>
          <span className="theme-switch__language theme-switch__language--en">EN</span>
        </span>
      </label>
    </div>
  )
}
