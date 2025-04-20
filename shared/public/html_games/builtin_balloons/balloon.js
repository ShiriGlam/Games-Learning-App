class Balloon {
  constructor(x, y, label, isCorrect) {
    this.x = x;
    this.y = y;
    this.radius = 50;
    this.label = label;
    this.isCorrect = isCorrect;
    this.speed = Math.random() * 1 + 1.5;
    this.popped = false;
  }

  draw(ctx) {
    if (this.popped) return;

    ctx.beginPath();
    ctx.fillStyle = "#FF69B4";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.label, this.x, this.y + 5);
  }

  update() {
    if (!this.popped) {
      this.y -= this.speed;
    }
  }

  isClicked(mx, my) {
    const dx = this.x - mx;
    const dy = this.y - my;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}
