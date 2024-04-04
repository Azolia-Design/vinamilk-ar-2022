const mainScript = () => {
    (function( $ ){
        "use strict";
    
        $.fn.countUp = function( options ) {
    
        // Defaults
        var settings = $.extend({
            'time': 2000,
            'delay': 10
        }, options);
    
        return this.each(function(){
    
            // Store the object
            var $this = $(this);
            var $settings = settings;
    
            var counterUpper = function() {
                if(!$this.data('counterupTo')) {
                    $this.data('counterupTo',$this.text());
                }
                var time = parseInt($this.data("counter-time")) > 0 ? parseInt($this.data("counter-time")) : $settings.time;
                var delay = parseInt($this.data("counter-delay")) > 0 ? parseInt($this.data("counter-delay")) : $settings.delay;
                var divisions = time / delay;
                var num = $this.data('counterupTo');
                var nums = [num];
                var isComma = /[0-9]+,[0-9]+/.test(num);
                num = num.replace(/,/g, '');
                var isInt = /^[0-9]+$/.test(num);
                var isFloat = /^[0-9]+\.[0-9]+$/.test(num);
                var decimalPlaces = isFloat ? (num.split('.')[1] || []).length : 0;
    
                // Generate list of incremental numbers to display
                for (var i = divisions; i >= 1; i--) {
    
                    // Preserve as int if input was int
                    var newNum = parseInt(Math.round(num / divisions * i));
    
                    // Preserve float if input was float
                    if (isFloat) {
                        newNum = parseFloat(num / divisions * i).toFixed(decimalPlaces);
                    }
    
                    // Preserve commas if input had commas
                    if (isComma) {
                        while (/(\d+)(\d{3})/.test(newNum.toString())) {
                            newNum = newNum.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
                        }
                    }
    
                    nums.unshift(newNum);
                }
    
                $this.data('counterup-nums', nums);
                $this.text('0');
    
                // Updates the number until we're done
                var f = function () {
                    if (!$this.data('counterup-nums')) {
                        return;
                    }
                    $this.text($this.data('counterup-nums').shift());
                    if ($this.data('counterup-nums').length) {
                        setTimeout($this.data('counterup-func'), $settings.delay);
                    } else {
                        delete $this.data('counterup-nums');
                        $this.data('counterup-nums', null);
                        $this.data('counterup-func', null);
                    }
                };
                
                $this.data('counterup-func', f);
    
                // Start the count up
                setTimeout($this.data('counterup-func'),delay);
            };
    
            // Perform counts when the element gets into view
            $this.waypoint(counterUpper, { offset: '100%', triggerOnce: true });
        });
    
        };
    
    })( jQuery );
    const ketikin = (selector, options) => {
        const baseTypingSpeed = 2
        const maxTypingSpeed = 100
        const defaultTimeGap = 1000
        const cursor = ''
    
        fenceSpeed = (speed) => {
            speed = speed > maxTypingSpeed ? maxTypingSpeed : speed
            speed = speed < 0 ? 0 : speed
            speed = maxTypingSpeed - speed
            return speed
        }
    
        getSeq = (element) => {
            return element.getAttribute('ketikin-seq')   
        }
    
        getCursor = (element) => {
            return element.querySelector('#' + getSeq(element)) || document.createElement("cursor")
        }
    
        animateCursor = (element) => {
            getCursor(element).animate([{opacity: 0.5}], {
                duration: defaultTimeGap,
                iterations: Infinity
            })
        }
    
        removeCursor = (element) => {
            getCursor(element).remove()
        }
    
        addCursor = (element) => {
            element.innerHTML = element.innerHTML + cursor
        }
    
        addTypingChar = (element, char) => {
            element.innerHTML = element.innerHTML + char
        }
    
        swapTypingText = (element, text) => {
            element.innerHTML = text
        }
    
        type = (element, char, executionTime) => {
            setTimeout(() => removeCursor(element) | addTypingChar(element, char) | addCursor(element), executionTime)
        }
    
        backSpace = (element, text, executionTime) => {
            setTimeout(() => removeCursor(element) | swapTypingText(element, text) | addCursor(element), executionTime)
            return text.substring(0, text.length - 1)
        }
    
        arrangeExecutionTime = (lastExecutionTime, speedBaseline) => {
            return lastExecutionTime + Math.floor(Math.random() * fenceSpeed(options.speed)) + speedBaseline
        }
    
        orchestrate = (element, text, shouldBackSpacing, executionTime) => {
            for(const char of text) {
                type(element, char, executionTime)
                executionTime = arrangeExecutionTime(executionTime, baseTypingSpeed)
            }
    
            if(shouldBackSpacing) {
                let backSpacingSpeed = baseTypingSpeed
                executionTime = executionTime + defaultTimeGap
                
                while(text) {
                    text = backSpace(element, text, executionTime)
                    executionTime = arrangeExecutionTime(executionTime, backSpacingSpeed)
                    backSpacingSpeed = Math.floor(backSpacingSpeed * 0.7)
                }
    
                setTimeout(() => swapTypingText(element, text) | addCursor(element), executionTime)
            }
    
            return executionTime
        }
    
        playOrchestration = (element, texts, opts) => {
            let executionTime = 0
            let shouldBackSpacing = false
    
            texts.forEach((text, index) => {
                shouldBackSpacing = (index < texts.length - 1 && !opts.loop) || opts.loop
                executionTime = orchestrate(element, text, shouldBackSpacing, executionTime) + defaultTimeGap
            })
    
            if(opts.loop) {
                setTimeout(() => playOrchestration(element, texts, opts), executionTime)
            } else {
                setTimeout(() => animateCursor(element), executionTime)
            }
        }
    
        setupOptions = (opts) => {
            return Object.assign({
                texts: null,
                speed: 0,
                loop: false
            }, opts)
        }
    
        setupTexts = (element, opts) => {
            return (opts.texts || [element.innerText]).filter(text => text)
        }
    
        setupElement = (element) => {
            element.setAttribute('ketikin-seq', 'seq-' + Math.random().toString(36).substr(2))
            element.innerHTML = ""
            return element
        }
    
        document.querySelectorAll(selector).forEach(el => {
            const opts = setupOptions(options)
            const texts = setupTexts(el, opts)
            const waypoint = new Waypoint({
                element: el,
                handler: function() {
                    if(texts.length > 0) {
                        playOrchestration(setupElement(el), texts, opts)
                    }
                },
                offset: '85%'
            })
        })
    }

    //Animate on scroll
    AOS.init({
        duration: 600,
        once: false,
    });
    $('[data-counter]').countUp({
        time: 1000 
    });
    ketikin("[data-typer]", {
        speed: 100,
    })

    //Lenis scroll
    let lenis = new Lenis({
        lerp: false,
        duration: 1.2
    });
    function raf(time) {
        lenis.raf(time)
        requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    lenis.on('scroll', function(inst) {
        if (inst.scroll > $('.header').height()) {
            $('.header').addClass('on-scroll')
            if (inst.direction == 1) {
                $('.header').addClass('on-hide')
            } else if (inst.direction == -1) {
                $('.header').removeClass('on-hide')
            }
        } else {
            $('.header').removeClass('on-scroll')
        }
    })

    $('[data-nav]').on('click', function(e) {
        e.preventDefault();
        let type = $(this).attr('data-nav');
        if (type == 'open') {
            $('.nav').addClass('active')
        } else if (type == 'close') {
            $('.nav').removeClass('active')
        }
    })

    //Multi-Language
    $('[data-lang]').on('click', function(e) {
        e.preventDefault();
        let type = $(this).attr('data-lang');
        if (type == 'open') {
            if ($('.header-lang-wrap').hasClass('active')) {
                $('.header-lang-wrap').removeClass('active')
            } else {
                $('.header-lang-wrap').addClass('active')
            }
        } else if (type == 'close') {
            $('.header-lang-wrap').removeClass('active')
        }
    })

    if (!$('[data-pagename="home"]').length) {
        let toLang = $('[data-lang-replace]').attr('data-lang-replace')
        let windowLocation = window.location;
        let newUrl;
        console.log(toLang)
        if (toLang == 'vn') {
            newUrl = windowLocation.href.replace('/en','')    
        } else if (toLang == 'en') {
            newUrl = windowLocation.origin + '/en' + windowLocation.pathname
        }
        $('[data-lang-replace]').attr('href', newUrl)
    }
    

    //Contact page
    if ($('[data-pagename="lienhe"]').length) {
        $('[data-accord="head"').on('click', function(e) {
            e.preventDefault();
            if ($(this).hasClass('active')) {
                $(this).removeClass('active')
                $(this).parent().find('[data-accord="body"]').slideUp();
            } else {
                $(this).addClass('active')
                $(this).parent().find('[data-accord="body"]').slideDown({
                    start: function() {
                        if ($(window).width() >= 768) {
                            $(this).css('display','grid');
                        }                      
                    }
                })
            }
        })
    }

    function detactPage() {
        let namePage = $('[data-pagename]').attr('data-pagename');
        $(`[data-link-header="${namePage}"]`).addClass('active')
    }
    detactPage()

    function clickToSection() {
        if ($('[data-section]').length >= 1) {
            let allSections = $('[data-section]')
            for (let x = 0; x < allSections.length; x++) {
                allSections.eq(x).attr('data-section', x)
            }
            let activeSc, nextSc, prevSc;
            let currentScroll = {scroll: lenis.targetScroll}
            lenis.on('scroll', function(inst) {
                detectSection(inst)
            })
            setTimeout(() => {
                detectSection(currentScroll)
            }, 100);
    
            function detectSection(scroller) {
                for (let x = 0; x < allSections.length; x++) {
                    let top = allSections.eq(x).offset().top - scroller.scroll;
                    if (top > (- $(window).height() / 5) && top <= ($(window).height() / 5)) {
                        activeSc = x
                        nextSc = x + 1;
                        prevSc = x - 1;
                        if (x == 0) {
                            $('.page-nav-left').addClass('inactive')
                            $('.page-nav-right').removeClass('inactive')
                        } else if (x == allSections.length - 1) {
                            $('.page-nav-right').addClass('inactive')
                            $('.page-nav-left').removeClass('inactive')
                        } else {
                            $('.page-nav-right').removeClass('inactive')
                            $('.page-nav-left').removeClass('inactive')
                        }
                        if (prevSc >= 0) {
                            $('.page-nav-left').attr('data-scroll', `[data-section="${prevSc}"]`)
                        }
                        if (nextSc < allSections.length) {
                            $('.page-nav-right').attr('data-scroll', `[data-section="${nextSc}"]`)
                        }
                    }
                }
            }
    
            $('.page-nav-ic-wrap').on('click', function(e) {
                e.preventDefault();
                let target = $(this).attr('data-scroll')
                lenis.scrollTo(target, {duration: 0, offset: -$(window).height()/14})
            })
        }
    }
    clickToSection()

    function dropdownInit() {
        if ($(window).width() > 991) {
            $('.header-link').on('mouseenter', function(e) {
                if ($(this).find('.ic-embed').length) {
                    $('.header-link-wrap-drop-wrapper').removeClass('active')
                    $(this).parent().find('.header-link-wrap-drop-wrapper').addClass('active')
                }
            })

            $('.header-link').on('mouseleave', function(e) {
                if ($(this).find('.ic-embed').length) {
                    setTimeout(() => {
                        if (!$(this).parent().find('.header-link-wrap-drop-wrapper').is(':hover')) {
                            $(this).parent().find('.header-link-wrap-drop-wrapper').removeClass('active')
                        }
                    }, 800);
                }
            })

            $('.header-link-wrap-drop-wrapper').on('mouseleave', function(e) {
                $(this).removeClass('active')
            })
        } else {
            $('.nav-link-item').on('click', function(e) {
                if ($(this).parent().find('.header-link-wrap-drop-wrap').length) {
                    e.preventDefault();
                    if ($(this).parent().find('.header-link-wrap-drop-wrap').hasClass('active')) {
                        $(this).parent().find('.header-link-wrap-drop-wrap').removeClass('active')
                    } else {
                        $('.header-link-wrap-drop-wrap').removeClass('active')
                        $(this).parent().find('.header-link-wrap-drop-wrap').addClass('active')
                    }
                }
            })
        }
    }
    dropdownInit()

}
window.onload = mainScript;