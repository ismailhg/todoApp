export function getTime() {
    let time = new Date();
    let day = String(time.getDate()).padStart(2, '0');
    let month = String(time.getMonth() + 1).padStart(2, '0');
    let year = time.getFullYear();
    return `${day}.${month}.${year}`;
}