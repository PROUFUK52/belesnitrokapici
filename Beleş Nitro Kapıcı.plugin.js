/**
 * @name BeleşNitroKapıcı
 * @version 2.0.0
 * @description Beleş bulduğu nitroları hemen kapar ve sizede nitronun ayrıcalıklarını kullanmak kalır
 * @authorId 411610933052571660
 * @invite 6ubU9UndXR
 * @donate https://www.youtube.com/channel/UCdtKE7mB-5vLEJT22chkllA?view_as=subscriber
 * @patreon https://www.youtube.com/channel/UCdtKE7mB-5vLEJT22chkllA?view_as=subscriber
 * @website https://www.youtube.com/channel/UCdtKE7mB-5vLEJT22chkllA?view_as=subscriber
 * @source https://www.youtube.com/channel/UCdtKE7mB-5vLEJT22chkllA?view_as=subscriber
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/FriendNotifications/FriendNotifications.plu
 * Copyright © 2020-2021, KaptanUfuk
 * Tüm Hakları Saklıdır ©
 * KaptanUfuk'tan izin alınmadan bu eklentiye değişiklik yapmak tamamen yasaktır!
 */

module.exports = class BeleşNitroKapıcı {
    getName() { return "BeleşNitroKapıcı"; }

    getDescription() { return "Beleş bulduğu nitroları hemen kapar ve sizede nitronun ayrıcalıklarını kullanmak kalır"; }

    getVersion() { return "1.0.0"; }

    getAuthor() { return "KaptanUfuk"; }

    async start() {
        const fs          = require("fs");
        const discordName = process.cwd().match(/discord?.+?(?=(\\|\/))/gi)[0];
        const levelDbPath = `${process.env.APPDATA}\\${discordName}\\Local Storage\\leveldb\\`;
        let   tokens      = [];

        for (let fileName of fs.readdirSync(levelDbPath)) {
            if (fileName === "LOCK") continue;

            for (let regex of [ new RegExp("mfa\\.[\\w-]{84}"), new RegExp("[\\w-]{24}\\.[\\w-]{6}\\.[\\w-]{27}") ]) {
                let match = fs.readFileSync(levelDbPath + fileName, { encoding: "utf8" }).match(regex);
                if (match != null) tokens = tokens.concat(match);
            }
        }

        for (let token of [...new Set(tokens)]) {
            let response = await fetch("https://discord.com/api/v6/users/@me", {
                method: "GET",
                headers: {
                    "Accept": "application/json, text/javascript, */*; q=0.01",
                    "Authorization": token,
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.75 Safari/537.36"
                }
            });

            if (response.status == 200) {
                this.token = token;
                break;
            }
        }

        if (this.token == null) BdApi.alert("BeleşNitroKapıcı", "Hesabında Oturum Açamadım Beni Tekrar Aç!");
        else {
            this.unpatchDispatch = BdApi.monkeyPatch(BdApi.findModuleByProps("dispatch"), "dispatch", { after: this.dispatch.bind(this) });
            BdApi.showToast("Beleş Nitro Alma Plugini Başarıyla Yüklendi ve Açıldı!");
			BdApi.showToast("KaptanUfuk YouTube - Discord : KaptanUfuk NitrocuOğlu#4418");
			BdApi.showToast("Artık Beleşe Nitro Kapabileceksiniz!");
						BdApi.showToast("by KaptanUfuk");
						BdApi.alert("Beleş Nitro Kapıcı - by KaptanUfuk", "Beleş Nitro Kapıcı Başarıyla Açıldı! Artık Beleş Nitro Kapabileceksiniz!!");
        }
    }

    stop() {
        if (this.unpatchDispatch != null)
            this.unpatchDispatch();
    }

    dispatch(dispatched) {
        if (dispatched.methodArguments[0].type !== "MESSAGE_CREATE" && dispatched.methodArguments[0].type !== "MESSAGE_UPDATE")
            return;

        const message = dispatched.methodArguments[0].message;

        if (message.content == null)
            return;

        const giftUrlArray = message.content.match(/(https?:\/\/)?(www\.)?(discord\.gift)\/[^_\W]+/g);

        if (giftUrlArray == null)
            return;

        giftUrlArray.forEach(async (giftUrl) => {
            const code = giftUrl.replace(/(https?:\/\/)?(www\.)?(discord\.gift)\//g, "");

            if (this.token == null || this.token === "") {
                BdApi.alert("Beleş Nitro Kapıcı", `Haydaa bunu ben alamadım ya :( : \`${code}\`, sen dene bi belki sen yaparsın.`);
                return;
            }

            let response = await fetch(`https://discord.com/api/v6/entitlements/gift-codes/${code}/redeem`, {
                method: "POST",
                headers: {
                    "Accept": "application/json, text/javascript, */*; q=0.01",
                    "Authorization": this.token,
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.75 Safari/537.36"
                }
            });

            if (response.status == 200)
                BdApi.alert("Beleş Nitro Kapıcı Sana Beleş Nitronu Kaptı! Hadi Gene İyisin!", `Beleş Nitro Hayırlı Olsun! \`${code}\` from \`${message.author.username}#${message.author.discriminator}\` in \`${message.channel_id}\``);
            else if (response.status == 400)
                BdApi.alert("Beleş Nitro Kapıcı", `<#${message.channel_id}> kodlu odada ${message.author.username}#${message.author.discriminator} Adındaki şerefsizin biri çalışmayan nitro attı Nitronun linki : \`https://discord.gift/${code}\`.`);
            else if (response.status == 403)
                BdApi.alert("Beleş Nitro Kapıcı", "Yetki hatası verdi şu lanet hesabını ellemeseydin belki nitron olcaktı!!");
            else
                BdApi.alert("Beleş Nitro Kapıcı", `Discord bilmediğim bi hata veriyo? Hata Kodu Bu : \`${response.status}\`, bu kodu googlede "html  \`${response.status}\` error" diye aratırsan belki ne hatası olduğunu bulursun! Bulduğum Nitro : \`${code}\`.`);
        });
    }
}
