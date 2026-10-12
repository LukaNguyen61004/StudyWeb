import PixelSnow from './PixelSnow'
import './SnowBackdrop.css'

function SnowBackdrop() {
  return (
    <div className="snow-backdrop" aria-hidden="true">
      <PixelSnow
        color="#ffffff"
        variant="snowflake"
        density={0.5}
        speed={1}
        wind={0.25}
        flakeSize={1}
        pixelSize={3}
        glow={0.8}
        mouseInteraction
        sway={0.5}
        twinkle={0.35}
        accumulate={false}
        depth={0.6}
        brightness={1}
        fade={0}
        opacity={1}
        intro
        lightMode={false}
      />
    </div>
  )
}

export default SnowBackdrop
