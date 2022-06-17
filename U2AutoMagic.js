// ==UserScript==
// @name         U2AutoMagic
// @namespace    https://github.com/zhaoyangwx/U2AutoMagic
// @version      0.1
// @description  U2LeechList: Scan and Magic
// @author       zhaoyangwx
// @supportURL   https://github.com/zhaoyangwx/U2AutoMagic/blob/main/README.md
// @match        https://u2.dmhy.org/userdetails.php?id=*&dllist=1
// @match        https://u2.dmhy.org/promotion.php?action=*&*
// @icon         https://u2.dmhy.org/favicon.ico
// @grant        GM_listValues
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/*
chrome防止脚本停止执行，请设置：
chrome://flags/
Calculate window occlusion on Windows = Disabled
*/

(function(){
    //详情页
    if (String(location).includes("https://u2.dmhy.org/userdetails.php?") & String(location).includes("dllist=1")){
        var refreshlist = function refreshlist() {
            'use strict';
            // Your code here...
            var tlist = document.evaluate("/html/body/table[2]/tbody/tr[2]/td/table/tbody/tr/td/table/tbody/tr[22]/td[2]/div/table/tbody/tr", document, null, XPathResult.ANY_TYPE)
            var tle = tlist.iterateNext();
            tle = tlist.iterateNext();
            if (tle){clearInterval(timer_waitlist)} else {return 0;}
            var idlist=[];
            while (tle){
                var ucount = document.evaluate("td[4]", tle, null, XPathResult.ANY_TYPE).iterateNext();
                var promotiontype = document.evaluate("td[2]/table/tbody/tr[2]/td/img", tle, null, XPathResult.ANY_TYPE).iterateNext();
                var idstring = document.evaluate("td[2]/table/tbody/tr[1]/td/a", tle, null, XPathResult.ANY_TYPE).iterateNext().getAttribute("href").replace('details.php?id=','').replace('&hit=1','');
                var freeflag = false
                if (promotiontype) {
                    //console.log(promotiontype.getAttribute("alt"));
                    freeflag = (promotiontype.getAttribute("alt").toLowerCase().includes("free"));
                }
                //console.log(ucount.textContent);
                //idlist.push(idstring);
                //console.log(idstring);
                if (ucount.textContent != "" && ucount.textContent != "0"){
                    if (freeflag){
                        // 有人上传且Free，仅标记
                        document.evaluate("td[5]", tle, null, XPathResult.ANY_TYPE).iterateNext().style.backgroundColor = '#00FF00';
                    }
                    else
                    {
                        // 有人上传且非Free，标记并记录
                        document.evaluate("td[5]", tle, null, XPathResult.ANY_TYPE).iterateNext().style.backgroundColor = '#FF7F00';
                        idlist.push(idstring);
                    }
                }
                else{
                    ucount.style.backgroundColor = '#AFAFAF';
                }
                tle = tlist.iterateNext();
            }
            console.log("OK at " + new Date());
            document.title = "@" + new Date()
            // do something with thisLink
            for(var i in idlist){
                // 查询记录，进入第一条的放魔法页，自动放魔法启用
                GM_setValue('promotion',true);
                //console.log(GM_getValue('promotion'));
                window.location.replace("https://u2.dmhy.org/promotion.php?action=magic&torrent="+idlist[i]);

                // 似乎不能直接完成，执行完一条等会回来重新检查就行了
                return 0;
            }
        }
        var timer_waitlist = setInterval(refreshlist, 1000);
        // 9-11分钟后自动刷新
        var timer_reload = setInterval(function(){
            clearInterval(timer_reload);
            //document.location.reload();
            window.open(location,"_blank");
            window.open('', '_self', '');
            window.close();
        }, 10*60*1000*(1+(Math.random()-0.5)*0.2))
        }
    // 魔法页
    if (String(location).includes("https://u2.dmhy.org/promotion.php")){
        console.log(GM_listValues());
        console.log(GM_getValue('promotion'));
        console.log(GM_getValue('return'));
        // 检查上一次魔法是否放完
        if (GM_getValue('return')==true){
            var timer_returntolist = setInterval(function(){
                            var presult = document.evaluate("/html/body/table[2]/tbody/tr[2]/td/table/tbody/tr/td/table[2]/tbody/tr/td/table/tbody/tr[9]/td[2]/b", document, null, XPathResult.ANY_TYPE);
                            presult = presult.iterateNext();
                            if (presult){
                                GM_setValue('return',false);
                                clearInterval(timer_returntolist);
                                // 返回到详情页
                                document.evaluate("/html/body/table[2]/tbody/tr[1]/td/table[2]/tbody/tr/td/table/tbody/tr/td[1]/span/a[11]", document, null, XPathResult.ANY_TYPE).iterateNext().click();
                            }
                        }, 1000)
            return 0;
        }
        // 检查是否启用自动放魔法
        if (GM_getValue('promotion')==false){return -1;}
        GM_setValue('promotion',false);

        // 等待加载完成
        var timer_promotionwait = setInterval(function(){
            var prom = document.evaluate("/html/body/table[2]/tbody/tr[2]/td/table/tbody/tr/td/table[2]/tbody/tr/td/form/table/tbody/tr[4]/td[2]/input", document, null, XPathResult.ANY_TYPE);
            console.log(prom);
            var ptime = prom.iterateNext();
            if (ptime){
                clearInterval(timer_promotionwait);
                // 修改期限24h、有效用户自己
                ptime.setAttribute("value","24");
                var rbptype = document.evaluate("/html/body/table[2]/tbody/tr[2]/td/table/tbody/tr/td/table[2]/tbody/tr/td/form/table/tbody/tr[2]/td[2]/input[2]", document, null, XPathResult.ANY_TYPE).iterateNext();
                rbptype.click();
                // 点计算，等待结果
                var btntest = document.evaluate("/html/body/table[2]/tbody/tr[2]/td/table/tbody/tr/td/table[2]/tbody/tr/td/form/table/tbody/tr[7]/td[2]/input", document, null, XPathResult.ANY_TYPE).iterateNext();
                btntest.click();
                var timer_pcost = setInterval(function(){
                    var target_pcost = document.evaluate("/html/body/table[2]/tbody/tr[2]/td/table/tbody/tr/td/table[2]/tbody/tr/td/form/table/tbody/tr[7]/td[2]/span/span/span[1]", document, null, XPathResult.ANY_TYPE);
                    target_pcost=target_pcost.iterateNext();
                    if (target_pcost){
                        clearInterval(timer_pcost);
                        // 放魔法，等待促销页面
                        var btnexecprom = document.evaluate("/html/body/table[2]/tbody/tr[2]/td/table/tbody/tr/td/table[2]/tbody/tr/td/form/input[9]", document, null, XPathResult.ANY_TYPE).iterateNext();
                        GM_setValue('return',true)
                        btnexecprom.click();
                        }
                }, 1000)
                console.log("OK");
            }
        }, 1000);
    }
})();
