function toDms(value: number, positive: string, negative: string) {
  const direction = value >= 0 ? positive : negative;
  const absolute = Math.abs(value);

  let degrees = Math.floor(absolute);
  let minutes = Math.floor((absolute - degrees) * 60);
  let seconds = Math.round((absolute - degrees - minutes / 60) * 3600);

  // pembulatan kl detik nembus 60
  if (seconds === 60) {
    seconds = 0;
    minutes++;
  }

  if (minutes === 60) {
    minutes = 0;
    degrees++;
  }

  return `${degrees}°${minutes}'${seconds}'' ${direction}`;
}

export function formatCoordinates(latitude: number, longitude: number) {
  return `${toDms(latitude, 'N', 'S')}, ${toDms(longitude, 'E', 'W')}`;
}
