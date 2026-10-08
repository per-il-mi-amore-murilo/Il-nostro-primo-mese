(() => {
  const root = document.querySelector('.creditos');
  if (!root) return;
  const rolo = root.querySelector('.creditos__rolo');
  const intro = root.querySelector('.creditos__intro');
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const inclinacao = 0;
  const velocidade = 58;
  const tempoIntro = 3200;

  let fase = 'intro', y = 0, inicio = 0, ultimo = 0, pausado = false, visivel = false;

  const comeco = () => rolo.offsetHeight * 1.02;
  const fimY = () => -rolo.offsetHeight * 1.06;

  function aplicar() {
    const p = Math.min(1, Math.max(0, (comeco() - y) / (comeco() - fimY())));
    rolo.style.opacity = p > 0.93 ? String(Math.max(0, (1 - p) / 0.07)) : '1';
    rolo.style.transform = `translateY(${y}px)`;
  }

  function reiniciar(agora) {
    fase = 'intro';
    y = comeco();
    inicio = agora;
    if (intro) intro.classList.add('on');
    aplicar();
  }

  function passo(agora) {
    requestAnimationFrame(passo);
    if (!visivel) { ultimo = agora; return; }
    const dt = Math.min(0.05, (agora - ultimo) / 1000);
    ultimo = agora;
    if (pausado) { inicio += dt * 1000; return; }
    if (fase === 'intro') {
      if (agora - inicio > tempoIntro) { fase = 'rolar'; if (intro) intro.classList.remove('on'); }
      return;
    }
    y -= velocidade * dt;
    if (y <= fimY()) { reiniciar(agora); return; }
    aplicar();
  }

  new IntersectionObserver(([e]) => {
    const antes = visivel;
    visivel = e.isIntersecting;
    if (visivel && !antes) reiniciar(performance.now());
    if (!visivel && antes) {
      fase = 'intro';
      if (intro) intro.classList.remove('on');
      y = comeco();
      aplicar();
    }
  }, { threshold: 0.6 }).observe(root);

  root.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') pausado = true; });
  root.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') pausado = false; });
  root.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') pausado = !pausado; });
  root.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pausado = !pausado; } });

  y = comeco();
  aplicar();
  requestAnimationFrame(t => { ultimo = t; passo(t); });
})();


(() => {
  const cards = [...document.querySelectorAll('.mv__card')];
  const vazio = document.querySelector('.mv__vazio');
  const btn = document.querySelector('.multi__sorteio');
  const cont = document.querySelector('.mv__cont');
  if (!cards.length || !btn) return;

  let fila = [], ultimo = -1, vistos = 0;

  const embaralhar = a => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  btn.addEventListener('click', () => {
    if (!fila.length) {
      fila = embaralhar(cards.map((_, i) => i));
      if (fila.length > 1 && fila[0] === ultimo) fila.push(fila.shift());
      vistos = 0;
    }
    const i = fila.shift();
    ultimo = i;
    vistos++;
    cards.forEach((c, k) => c.classList.toggle('on', k === i));
    if (vazio) vazio.hidden = true;
    btn.textContent = '✦ Sortear outro';
    if (cont) cont.textContent = `${vistos} / ${cards.length}` + (fila.length ? '' : ' · todos vistos!');
  });
})();
